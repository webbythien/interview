import traceback
from datetime import datetime
import boto3
import uuid
from src.config import settings

# AWS S3 Configuration
S3_BUCKET_NAME = settings.AWS_BUCKET
S3_ACCESS_KEY = settings.S3_ACCESS_KEY
S3_SECRET_KEY = settings.S3_SECRET_KEY
S3_REGION = settings.AWS_REGION

# Initialize S3 client
s3 = boto3.client(
    's3',
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    region_name=S3_REGION  # Ensure the region is specified correctly
)

class S3AWSHelpers:

    @classmethod
    def upload_image(cls, file, sub_folder):
        try:
            name_prefix = int(datetime.today().timestamp())
            _filename = str(uuid.uuid4())
            file_extension = file.filename.split(".")[-1]
            key_path_upload = f'{sub_folder}/{name_prefix}_{_filename}.{file_extension}'

            s3.put_object(
                Body=file.file,
                Bucket=S3_BUCKET_NAME,
                Key=key_path_upload,
                ContentType=file.content_type,
            )
            return f'https://{S3_BUCKET_NAME}.s3.{S3_REGION}.amazonaws.com/{key_path_upload}'
        except Exception as e:
            traceback.print_exc()
            print("Something went wrong: ", e)
            return ''

    @classmethod
    def upload_doc(cls, file, sub_folder):
        try:
            name_prefix = int(datetime.today().timestamp())
            _filename = str(uuid.uuid4())
            file_extension = file.filename.split(".")[-1]
            key_path_upload = f'{sub_folder}/{name_prefix}_{_filename}.{file_extension}'

            s3.put_object(
                Body=file.file,
                Bucket=S3_BUCKET_NAME,
                Key=key_path_upload,
                ContentType=file.content_type,
            )
            return f'https://{S3_BUCKET_NAME}.s3.{S3_REGION}.amazonaws.com/{key_path_upload}'
        except Exception as e:
            traceback.print_exc()
            print("Something went wrong: ", e)
            return ''
