import json
import traceback
from datetime import datetime
import boto3
import uuid

# from lib.logger import debug
from src.config import settings
S3_ENDPOINT = settings.AWS_REGION

S3_ACCESS_KEY=settings.S3_ACCESS_KEY
S3_SECRET_KEY= settings.S3_SECRET_KEY
S3_BUCKET_NAME=settings.AWS_BUCKET

print(S3_ACCESS_KEY, S3_SECRET_KEY,S3_ENDPOINT)

s3 = boto3.client(
    "s3",
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
)


class S3AWSHelpers:

    @classmethod
    def upload_image(cls, file, sub_folder):
        try:
            name_prefix = int(datetime.today().timestamp())

            _filename = str(uuid.uuid4())

            key_path_upload = f'{sub_folder}/{name_prefix}_{_filename}.{file.filename.split(".")[-1]}'
            s3.put_object(
                Body= file.file,
                Bucket=S3_BUCKET_NAME,
                Key=key_path_upload,
                ContentType=file.content_type,
            )
            print("key_path_upload ", key_path_upload)
            return f'{settings.STATIC_LINK}/{key_path_upload}'
        except Exception as e:
            traceback.print_exc()
            print("Something went wrong: ", e)
            return ''
