import logging
import random
import string
import logging
import random
import string
import re
import os

from databases.interfaces import Record

logger = logging.getLogger(__name__)
ALPHA_NUM = string.ascii_letters + string.digits


def generate_random_alphanum(length: int = 20) -> str:
    return "".join(random.choices(ALPHA_NUM, k=length))

def convert_record_to_dict(record: Record | None) -> dict | None:
    if not record:
        return None
    return dict(record._mapping)


def convert_sql_record_to_dict(
    record: list[Record | None] | Record | None,
) -> list[dict] | dict | None:
    if isinstance(record, list):
        return [convert_record_to_dict(row) for row in record]
    return convert_record_to_dict(record)
