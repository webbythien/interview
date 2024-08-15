from redis import asyncio as aioredis

from src import redis
from src.config import settings
from src.database import database, Base, engine



async def on_start():
    # pool = aioredis.ConnectionPool.from_url(
    #     settings.REDIS_URL, max_connections=10, decode_responses=True
    # )
    # redis.redis_client = aioredis.Redis(connection_pool=pool)
    await database.connect()
    Base.metadata.create_all(bind=engine)


async def on_shutdown():
    await database.disconnect()
    await redis.redis_client.close()
