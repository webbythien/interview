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
from .schemas import CreateGroupRequest,JoinGroupRequest
from .models import Group, GroupConversation, Conversation
from sqlalchemy import func, desc, and_

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
         .group_by(Group.id)
        
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
            else:
                recent_message = None

            result.append({
                "id": group.id,
                "name": group.name,
                "time": "15h:05",#group.created_at.isoformat(),  # Convert datetime to string
                "member_count": member_count,
                "recent_senders": recent_senders,
                "msg": recent_message if recent_message is not None else "Welcome to new group",
                "online":True,
                "unread":False,
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
    