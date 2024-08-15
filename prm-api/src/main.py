__import__('os').environ['TZ'] = 'UTC'

from src.on import on_start, on_shutdown

import sentry_sdk
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from src import redis
# from src.auth.router import router as auth_router
from src.chat.router import router as chat_router
from src.config import app_configs, settings
from src.database import database
from sentry_sdk.integrations.fastapi import FastApiIntegration
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(**app_configs)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Startup
    await on_start()


@app.on_event("shutdown")
async def shutdown():
    await on_shutdown()


if settings.ENVIRONMENT.is_deployed:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        integrations=[FastApiIntegration()]
    )
    sentry_sdk.capture_message("run server")


@app.get("/healthcheck", include_in_schema=False)
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}

# app.include_router(chat_router, prefix="/chat", tags=["Chat"])
