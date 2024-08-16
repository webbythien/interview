from sqlalchemy import (
    Column,
    DateTime,
    Boolean,
    Integer,
    String,
    LargeBinary,
    ForeignKey,
    Text,
    Float
)

import uuid
from ..database import Base
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

class Message(Base):
    __tablename__ = 'message'

    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_id = Column(Integer, nullable=False)
    reciever_id = Column( Integer,nullable=False)
    message = Column(String(1000), nullable= True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    status = Column(Integer, nullable=False, default=1)
    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "reciever_id": self.reciever_id,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at,
        }


class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    password = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    status = Column(Integer, nullable=False, default=1)

class GroupConversation(Base):
    __tablename__ = 'group_conversation'
    id = Column(Integer, primary_key=True, autoincrement=True)
    group_id = Column(Integer, nullable=False)
    user_uuid = Column(String(255), nullable=False)
    username = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    status = Column(Integer, nullable=False, default=1)
    

class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_uuid = Column(String(255), nullable=False)
    reciever_id = Column( Integer,nullable=False)
    message = Column(String(1000), nullable=True)
    type = Column(String(255), nullable= False)
    text = Column(String(255), nullable=True)
    subtype = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    status = Column(Integer, nullable=False, default=1)

class Docs(Base):
    __tablename__ = 'docs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable= False)
    link = Column(String(255), nullable= False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    status = Column(Integer, nullable=False, default=1)

class ConversationImage(Base):
    __tablename__ = 'conversation_image'
    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, nullable=False)
    img = Column(String(255), nullable= False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    status = Column(Integer, nullable=False, default=1)