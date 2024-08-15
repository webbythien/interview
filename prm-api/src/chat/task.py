import logging
import uuid
from datetime import datetime, timedelta
import traceback
from src import worker
from src.database import session
from src.chat.models import Message
logging.getLogger().setLevel(logging.INFO)
from src.emitter import socket_io
from fastapi.encoders import jsonable_encoder
from src.config import settings
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
import asyncio
from jinja2 import Environment, FileSystemLoader
from decimal import Decimal
import os
from typing import List, Optional
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Response,
    UploadFile,
    status,
    Query,
    Path,
    Request,
    Form
)
from src.chat.models import Group, GroupConversation, Conversation,ConversationImage,Docs
from src.s3 import S3AWSHelpers

mail_conf = {
    "MAIL_USERNAME": "thiengk563@gmail.com",
    "MAIL_PASSWORD": "cqespfiwchsvxxtv",
    "MAIL_FROM": "thiengk563@gmail.com",
    "MAIL_PORT": 465,
    "MAIL_SERVER": "smtp.gmail.com",
    "MAIL_STARTTLS": False,
    "MAIL_SSL_TLS": True,
}
from jinja2 import Template
from src.template.order_template import template_string

current_dir = os.path.dirname(os.path.abspath(__file__))

template_dir = os.path.join(current_dir, '..', 'template')
env = Environment(loader=FileSystemLoader(template_dir))
from decimal import Decimal

@worker.task_manage.task(name="send_order_task")
@worker.sync_task
async def send_order_task(email: str, name: str, products: list, shipping_fee: float):
    try:
        connection_conf = ConnectionConfig(**mail_conf)
        fast_mail = FastMail(connection_conf)
        
        product_rows = ""
        total = Decimal('0.00')
        
        for product in products:
            price = Decimal(str(product['price']))  # Convert float to Decimal
            quantity = int(product['quantity'])  # Ensure quantity is int
            subtotal = price * quantity
            total += subtotal
            product_rows += f"""
            <tr>
                <td>{product['name']}</td>
                <td>{quantity}</td>
                <td>{price:.2f} VND</td>
                <td>{subtotal:.2f} VND</td>
            </tr>
            """
        
        shipping_fee_decimal = Decimal(str(shipping_fee))  # Convert float to Decimal
        total += shipping_fee_decimal
        
        template = Template(template_string)
        html_content = template.render(
            name=name,
            product_rows=product_rows,
            shipping_fee=f"{shipping_fee_decimal:.2f} VND",
            total=f"{total:.2f} VND"
        )

        message = MessageSchema(
            subject="Your Order Invoice",
            recipients=[email],
            body=html_content,
            subtype="html",
        )

        await fast_mail.send_message(message)
    except Exception as e:
        traceback.print_exc()
        raise e
    
@worker.task_manage.task(name="send_message_task")
@worker.sync_task
async def send_message_task(
    receiver_id: int, 
    sender_uuid: str, 
    message: str = None, 
    files: List[dict] = None,
    task_id: str = None
):
    try:
        db = session()
        subtype = None
        file_urls = []
        img_urls = []
        doc_data = {}

        # Create a new conversation record
        new_conversation = Conversation(
            sender_uuid=sender_uuid,
            reciever_id=receiver_id,
            message=message,
            type="msg",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(new_conversation)
        db.flush()  # Ensure the ID is assigned

        # Process files if any
        if files:
            for file in files:
                file_url = file['url']
                file_type = file['type']
                filename = file['filename']

                if file_type == 'img':
                    subtype = 'img'
                    img_urls.append(file_url)
                elif file_type == 'doc':
                    subtype = 'doc'
                    doc_data = {
                        "name": filename,
                        "link": file_url
                    }

                file_urls.append(file_url)

        # Update the subtype of the conversation
        new_conversation.subtype = subtype
        db.add(new_conversation)
        db.commit()

        # Construct the message data to emit
        new_message_data = {
            "type": "msg",
            "message": message,
            "uuid": sender_uuid,
            "id": new_conversation.id,
            "created_at": new_conversation.created_at.isoformat(),
            "subtype": subtype,
            "task_id": task_id,
            "sent": 2
        }
        
        # Add subtype-specific fields
        if subtype == 'img':
            new_message_data['img'] = img_urls
        elif subtype == 'doc':
            new_message_data['doc'] = doc_data

        user_uuids_tuples = db.query(GroupConversation.user_uuid).filter(GroupConversation.group_id == receiver_id).all()
        user_uuids = [uuid for (uuid,) in user_uuids_tuples]

        # Print user UUIDs for debugging
        print("user_uuids : ", user_uuids)

        # Emit the new message to each user individually
        for user_uuid in user_uuids:
            socket_io.To(str(user_uuid)).Emit("message", new_message_data)
            
        return {"status": "success", "task_id": task_id}

    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise e
