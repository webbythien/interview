from databases import Database
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import (
    MetaData,
    create_engine,
)
from src.config import settings

DATABASE_URL = settings.DATABASE_URL
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_size": 8,
    "max_overflow": 4,
    "pool_timeout": 10,
    "pool_recycle": 300,
}

database = Database(DATABASE_URL)
engine = create_engine(DATABASE_URL, **SQLALCHEMY_ENGINE_OPTIONS)
session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base(metadata=MetaData(bind=engine))

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()