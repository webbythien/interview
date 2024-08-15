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
