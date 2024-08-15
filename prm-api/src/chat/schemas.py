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
