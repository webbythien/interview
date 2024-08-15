__import__('os').environ['TZ'] = 'UTC'

import json

# import sentry_sdk
from celery import Celery
from sentry_sdk.integrations.celery import CeleryIntegration

from src.config import settings
import asyncio
import functools

from celery.signals import worker_process_init, worker_process_shutdown
from src.on import on_start, on_shutdown


def sync_task(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if asyncio.get_event_loop().is_closed():
            asyncio.set_event_loop(asyncio.new_event_loop())
        return asyncio.get_event_loop().run_until_complete(f(*args, **kwargs))

    return wrapper


def create_worker():
    celery = Celery(__name__, broker=settings.BROKER_URL)
    setting_dict = settings.dict()
    setting_dict['BROKER_URL']='amqp://root:JWFxI45LaoZ9Ga7AJ3Ahdd2r@34.126.177.133:5672'
    print('check : ', setting_dict)
    celery.conf.update(setting_dict)
    print('Init Celery tasks app')

    return celery


task_manage = create_worker()


@worker_process_init.connect
def init_worker(**kwargs):
    # if settings.ENVIRONMENT.is_deployed:
    #     sentry_sdk.init(
    #         dsn=settings.SENTRY_DSN,
    #         environment=settings.ENVIRONMENT,
    #         integrations=[CeleryIntegration()]
    #     )
    #     sentry_sdk.capture_message("run worker assets")

    asyncio.get_event_loop().run_until_complete(on_start())


@worker_process_shutdown.connect
def shutdown_worker(**kwargs):
    asyncio.get_event_loop().run_until_complete(on_shutdown())
