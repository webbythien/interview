from socket_io_emitter import Emitter

from src.config import settings

print("settings.REDIS_URL", settings.REDIS_URL)
socket_io = Emitter(
    opts={
        "host": settings.REDIS_HOST,
        "port": settings.REDIS_PORT,
    }
)
