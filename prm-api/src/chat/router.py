import logging
import uuid

# import boto3
import requests

# from databases.interfaces import Record
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
from sqlalchemy import asc, desc, func, or_,select,case
from typing import List, Optional
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from src.config import settings
from src import tasks
from src.database import get_db
from src.worker import task_manage
import traceback
from src.s3 import S3AWSHelpers
from sqlalchemy.exc import IntegrityError

logging.getLogger().setLevel(logging.INFO)
from math import ceil
from datetime import datetime, timedelta
import uuid
from fastapi.responses import RedirectResponse
from .schemas import SendMessageRequest
from src.worker import task_manage
from .models import Message
from sqlalchemy.future import select as async_select
from decimal import Decimal
router = APIRouter()
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from src.database import get_db
from .schemas import CreateGroupRequest,JoinGroupRequest, UploadedFileInfo
from .models import Group, GroupConversation, Conversation,ConversationImage,Docs
from sqlalchemy import func, desc, and_
from uuid import uuid4


@router.post("/upload-files", response_model=List[UploadedFileInfo])
async def upload_files(files: List[UploadFile] = File(...)):
    uploaded_files = []

    for file in files:
        content_type = file.content_type
        
        if content_type.startswith('image/'):
            file_type = 'img'
            file_url = S3AWSHelpers.upload_image(file, "PRM")
        elif content_type in ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            file_type = 'doc'
            file_url = S3AWSHelpers.upload_doc(file, "PRM")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        if not file_url:
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {file.filename}")

        uploaded_files.append(UploadedFileInfo(
            url=file_url,
            type=file_type,
            filename=file.filename
        ))

    return uploaded_files

@router.post("/test/mail")
async def send_mail():
    # Lấy thông tin từ send_msg_data
    recipient_email = "thiengk563@gmail.com"#send_msg_data.to.email
    subject = "Test" #send_msg_data.subject
    html_content = "<p>abc</p>" #send_msg_data.htmlContent
    
    # Xây dựng kwargs cho send_task
    kwargs = {
        "to":{
        "email":"thiennhse162099@fpt.edu.vn",
        "name":"Thien"
        },
        "subject":subject,
        "html_content":html_content,
        "task":"SEND_MAIL"
    }
    
    # Nếu cần, bạn có thể thêm các thông tin khác vào kwargs như task_id
    # task_id = ...
    # kwargs["task_id"] = task_id
    
    # Gọi hàm send_task với kwargs đã xây dựng
    products = [
    {"name": "Product A", "quantity": 2, "price": "19.99"},
    {"name": "Product B", "quantity": 1, "price": "29.99"},
    {"name": "Product C", "quantity": 3, "price": "9.99"},
]
    shipping_fee = Decimal('5.00')

    task_id = task_manage.send_task(
        "send_order_task",
        # kwargs=kwargs
        kwargs={
            "email":"thiengk563@gmail.com",
            "name":"Thien",
            "products":products,
            "shipping_fee":shipping_fee
        }
      
    )
    
    print("send_mail: ", task_id)
    
    return {
        "msg": "Send message successfully"
    }

@router.post("/groups", status_code=status.HTTP_201_CREATED)
async def create_group(group_data: CreateGroupRequest, db: Session = Depends(get_db)):
    try:
        # Create a new group
        new_group = Group(name=group_data.name)
        db.add(new_group)
        db.flush()
        db.refresh(new_group)
        
        # Add the creator to the group
        new_conversation = GroupConversation(
            group_id=new_group.id,
            user_uuid=group_data.user_uuid,
            username=group_data.username
        )
        db.add(new_conversation)
        db.commit()

        return JSONResponse(
            content={
                "group": {
                    "id": new_group.id,
                    "name": new_group.name,
                    "created_at": new_group.created_at.isoformat() 
                }
            },
            status_code=status.HTTP_201_CREATED
        )

    except Exception as e:
        traceback.print_exc()
        db.rollback()
        logging.error(f"Error creating group: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create group")


@router.get("/groups", status_code=status.HTTP_200_OK)
async def get_all_groups(
    limit: int = Query(10, description="Limit the number of results returned"), 
    offset: int = Query(0, description="Number of results to skip"),
    db: Session = Depends(get_db)
):
    try:
        # Query to get group details along with user counts
        groups_query = db.query(
            Group,
            func.count(GroupConversation.id).label("member_count")
        ).outerjoin(GroupConversation, Group.id == GroupConversation.group_id)\
         .group_by(Group.id)\
         .order_by(desc(Group.id))  # Sort by group ID in descending order
        
        total_groups = groups_query.count()

        # Apply pagination
        groups = groups_query.offset(offset).limit(limit).all()

        result = []
        for group, member_count in groups:
            group_id = group.id

            # Get the 3 most recent senders by username
            recent_senders_query = db.query(
                GroupConversation.username
            ).filter(
                GroupConversation.group_id == group_id
            ).order_by(desc(GroupConversation.created_at)).limit(3)
            recent_senders = [sender.username for sender in recent_senders_query]

            # Get the most recent message
            recent_message_query = db.query(
                func.max(Conversation.created_at).label("last_message_time")
            ).filter(
                Conversation.reciever_id == group_id
            ).scalar()

            if recent_message_query:
                most_recent_message = db.query(Conversation)\
                    .filter(
                        and_(
                            Conversation.reciever_id == group_id,
                            Conversation.created_at == recent_message_query
                        )
                    ).first()
                recent_message = most_recent_message.message if most_recent_message else None
                time_to_display = recent_message_query.strftime("%a %H:%M")  # Format datetime
            else:
                recent_message = None
                time_to_display = group.created_at.strftime("%a %H:%M")  # Format datetime from group

            result.append({
                "id": group.id,
                "name": group.name,
                "time": time_to_display,
                "member_count": member_count,
                "recent_senders": recent_senders,
                "msg": recent_message if recent_message is not None else "Welcome to new group",
                "online": True,
                "unread": False,
            })

        return JSONResponse(
            content={
                "groups": result, 
                "total": total_groups,
                "limit": limit,
                "offset": offset
            }, 
            status_code=status.HTTP_200_OK
        )

    except Exception as e:
        traceback.print_exc()
        logging.error(f"Error fetching groups: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch groups")
    
@router.post("/join-group", status_code=status.HTTP_200_OK)
async def join_group(
    request: JoinGroupRequest, 
    db: Session = Depends(get_db)
):
    try:
        # Check if the group exists
        group = db.query(Group).filter(Group.id == request.group_id).first()
        if not group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

        # Add the user to the group
        new_member = GroupConversation(
            group_id=request.group_id,
            user_uuid=request.uuid,
            username=request.username
        )
        db.add(new_member)
        db.commit()

        # Fetch updated group details
        group_details = db.query(Group).filter(Group.id == request.group_id).first()
        if not group_details:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

        member_count = db.query(GroupConversation).filter(GroupConversation.group_id == request.group_id).count()

        return {
            "group": {
                "id": group_details.id,
                "name": group_details.name,
                "created_at": group_details.created_at.isoformat(),
                "member_count": member_count
            },
            "message": "Successfully joined the group"
        }

    except IntegrityError as e:
        db.rollback()
        logging.error(f"IntegrityError: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error adding user to group")
    except Exception as e:
        traceback.print_exc()
        logging.error(f"Error joining group: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to join group")


@router.post("/conversations")
async def create_conversation(request: SendMessageRequest):
    try:
        task_id = str(uuid.uuid4())
        
        # Chuyển đổi các đối tượng FileInfo thành dict
        files_dict = [file.dict() for file in request.files] if request.files else None
        
        task_manage.send_task(
            "send_message_task",
            kwargs={
                "receiver_id": request.receiver_id,
                "sender_uuid": request.sender_uuid, 
                "message": request.message,
                "files": files_dict,
                "task_id": task_id
            }
        )

        return {
            "msg": "Send message task initiated successfully",
            "task_id": task_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/groups/{group_id}/messages")
async def get_group_messages(
    group_id: int,
    limit: int = Query(20, description="Number of messages to return"),
    offset: int = Query(0, description="Number of messages to skip"),
    start_id: Optional[int] = Query(None, description="ID to start fetching messages from"),
    db: Session = Depends(get_db)
):
    try:
        # Base query to get messages for the specified group_id
        messages_query = db.query(Conversation).filter(Conversation.reciever_id == group_id)

        if start_id:
            # Fetch messages after the start_id
            messages_query = messages_query.filter(Conversation.id < start_id)
        
        # Fetch messages with pagination and ordering
        messages = messages_query.order_by(Conversation.created_at.asc()).offset(offset).limit(limit + 1).all()

        # Determine if there are more messages
        has_more = len(messages) > limit
        if has_more:
            messages = messages[:-1]  # Remove the extra message used for checking

        result = [format_message(msg, db) for msg in messages]

        # Get total message count
        total_messages = db.query(func.count(Conversation.id)).filter(Conversation.reciever_id == group_id).scalar()

        return {
            "messages": result,
            "total": total_messages,
            "limit": limit,
            "offset": offset,
            "has_more": has_more
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch messages")

def format_message(message, db):
    """Format a single message record."""
    message_data = {
        "type": "msg",
        "message": message.message,
        "uuid": message.sender_uuid,
        "created_at": message.created_at.isoformat()  # Format datetime to string
    }
    
    if message.subtype:
        message_data["subtype"] = message.subtype

    if message.subtype == "img":
        images = db.query(ConversationImage).filter(ConversationImage.conversation_id == message.id).all()
        message_data["img"] = [image.img for image in images]
    elif message.subtype == "doc":
        docs = db.query(Docs).filter(Docs.conversation_id == message.id).all()
        if docs:
            message_data["doc"] = {
                "name": docs[0].name,
                "link": docs[0].link
            }

    return message_data
# @router.post("")
# async def send_message(
#     send_msg_data: SendMessageRequest, db: Session = Depends(get_db)
# ):
#     try:

#         task_id = task_manage.send_task(
#             "send_message_task",
#             kwargs={
#                 "reciever_id": send_msg_data.reciever_id,
#                 "sender_id": send_msg_data.sender_id,
#                 "message": send_msg_data.message,
#             },
#         )
#         return {
#             "msg":"Send message successfully"
#         }
#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get('/admin')
# async def get_message_admin(
#     db: Session = Depends(get_db),
# ):
#     try:
#         subquery = (
#             select(
#                 Message.id,
#                 Message.sender_id,
#                 Message.reciever_id,
#                 Message.message,
#                 Message.created_at,
#                 case(
#                     (Message.sender_id == 0, Message.reciever_id),
#                     else_=Message.sender_id
#                 ).label('user_id'),
#                 func.row_number().over(
#                     partition_by=case(
#                         (Message.sender_id == 0, Message.reciever_id),
#                         else_=Message.sender_id
#                     ),
#                     order_by=desc(Message.created_at)
#                 ).label('rn')
#             )
#             .where((Message.sender_id == 0) | (Message.reciever_id == 0))
#             .alias('LastMessages')
#         )

#         query = (
#             async_select(
#                 subquery.c.user_id,
#                 subquery.c.id.label('message_id'),
#                 subquery.c.sender_id,
#                 subquery.c.reciever_id,
#                 subquery.c.message,
#                 subquery.c.created_at,
#                 User.username,  # Add username to the select statement
#                 User.email,
#                 User.url_avatar
#             )
#             .select_from(subquery)
#             .join(User, User.id == subquery.c.user_id)  # Join with User table
#             .where(subquery.c.rn == 1)
#             .order_by(desc(subquery.c.created_at))
#         )
#         result =  db.execute(query)
#         messages = result.fetchall()
#         return messages
#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))


# @router.get('/{user_id}')
# async def get_message_user_id(
#     user_id: int , db: Session = Depends(get_db)
# ):
#     try:
#         messages = db.query(Message).filter(
#         ((Message.sender_id == user_id) & (Message.reciever_id == 0)) |
#         ((Message.sender_id == 0) & (Message.reciever_id == user_id))
#     ).order_by(asc(Message.created_at  )).all()
    
#     # Convert the result to a list of dictionaries
#         conversation = [message.to_dict() for message in messages]
    
#         return conversation
#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))
    