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
async def send_message_task(reciever_id: int , sender_id: int, message: str):
    try:
        db = session()
        message = Message(
            sender_id= sender_id,
            reciever_id = reciever_id,
            message = message
        )
        db.add(message)
        db.flush()
        db.refresh(message)

        socket_io.To(str(reciever_id)).Emit("message", jsonable_encoder(message))
        db.commit()
    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise e