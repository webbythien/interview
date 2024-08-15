from datetime import datetime

__import__('os').environ['TZ'] = 'UTC'


print(datetime.now().timestamp())