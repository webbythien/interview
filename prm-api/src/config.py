from typing import Any

from pydantic import root_validator
from pydantic_settings import BaseSettings

from src.constants import Environment


class Config(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    REDIS_HOST: str
    REDIS_PORT: int
    BROKER_URL: str = 'amqp://root:JWFxI45LaoZ9Ga7AJ3Ahdd2r@34.126.177.133:5672'
    S3_ACCESS_KEY:str
    S3_SECRET_KEY:str
    AWS_BUCKET:str
    AWS_REGION:str
    STATIC_LINK:str
    SITE_DOMAIN: str = "myapp.com"
    ENVIRONMENT: Environment = Environment.PRODUCTION
    SENTRY_DSN: str | None = None
    APP_VERSION: str = "v1"
    JWT_ALG : str
    JWT_SECRET: str
    CELERY_ROUTES: dict = {
        "send_message_task": {
            "queue": "message_queue"
        },
         "SEND_MAIL": {
            "queue": "email_queue"
        },
        "send_order_task": {
            "queue": "order_queue"
        },
    }
    CELERY_TASK_SERIALIZER: str = 'json'
    CELERY_RESULT_SERIALIZER: str = 'json'
    CELERY_ACCEPT_CONTENT: list[str] = ['json']
    CELERY_IMPORTS: list[str] = ['src.tasks']
    CELERY_RESULT_BACKEND :str = 'rpc'
    JWT_EXP: str
    

    # CELERY_ROUTES: dict = {
    #     "hello_task": {
    #         "queue": "hello"
    #     }
    # }
    # CELERY_RESULT_DB_TABLENAMES: dict = {
    #     'task': 'tripseg_tasks',
    #     'group': 'tripseg_task_group',
    # }
    # CELERY_IMPORTS: list[str] = ['src.tasks']
    MAIL_PASSWORD: str

    
    class Config:
        env_file = ".env"

    @root_validator(skip_on_failure=True)
    def validate_sentry_non_local(cls, data: dict[str, Any]) -> dict[str, Any]:
        if data["ENVIRONMENT"].is_deployed and not data["SENTRY_DSN"]:
            raise ValueError("Sentry is not set")

        return data


settings = Config()

app_configs: dict[str, Any] = {"title": "PRM API","root_path": "/v1/api",}
