import re

from typing_extensions import Annotated
from pydantic import EmailStr, Field, validator, StringConstraints
from typing import Optional
from src.models import ORJSONModel
from fastapi import HTTPException
import datetime


class SendMessageRequest(ORJSONModel):
    sender_id: int
    reciever_id: int
    message: str

class CreateGroupRequest(ORJSONModel):
    name: str = Field(..., min_length=3, max_length=255, description="The name of the group")
    user_uuid: str = Field(..., min_length=36, max_length=36, description="The UUID of the user creating the group")
    username: str = Field(..., min_length=3, max_length=255, description="The username of the user creating the group")
    
    @validator('name')
    def validate_name(cls, value):
        if not re.match(r'^[\w\s-]+$', value):
            raise HTTPException(status_code=400, detail="Group name contains invalid characters.")
        return value

    @validator('user_uuid')
    def validate_user_uuid(cls, value):
        if not re.match(r'^[a-fA-F0-9-]{36}$', value):
            raise HTTPException(status_code=400, detail="Invalid UUID format.")
        return value

    @validator('username')
    def validate_username(cls, value):
        if not re.match(r'^\w+$', value):
            raise HTTPException(status_code=400, detail="Username contains invalid characters.")
        return value
    

class JoinGroupRequest(ORJSONModel):
    uuid: str
    username: str
    group_id: int