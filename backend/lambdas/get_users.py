import os
import json
import logging
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr

# ——— Setup clients & logging ———
logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb    = boto3.resource('dynamodb')
USERS_TABLE = os.environ.get('USERS_TABLE', 'Users')
table       = dynamodb.Table(USERS_TABLE)

def lambda_handler(event, context):
    # 1) Extract authorizer payload (v2 jwt.claims or v1 claims)
    auth = event.get('requestContext', {}).get('authorizer', {}) or {}
    claims = auth.get('jwt', {}).get('claims') \
             or auth.get('claims') \
             or {}
    logger.info("JWT claims received: %s", claims)

    # 2) Normalize cognito:groups into a Python list
    raw = claims.get('cognito:groups', [])
    groups = []

    if isinstance(raw, list):
        groups = raw

    elif isinstance(raw, str):
        # If it's JSON-looking, parse it
        raw_str = raw.strip()
        if raw_str.startswith('[') and raw_str.endswith(']'):
            try:
                parsed = json.loads(raw_str)
                if isinstance(parsed, list):
                    groups = parsed
                else:
                    groups = [str(parsed)]
            except json.JSONDecodeError:
                # fallback to comma‑split
                groups = [g.strip() for g in raw_str.strip('[]').split(',') if g.strip()]
        else:
            # comma‑separated fallback
            groups = [g.strip() for g in raw_str.split(',') if g.strip()]

    logger.info("Normalized groups list: %s", groups)

    # 3) Case‑insensitive admin check
    if not any(g.lower() == 'admin' for g in groups):
        return {
            'statusCode': 403,
            'body': json.dumps({'message': 'Forbidden: admin only'})
        }

    # 4) Scan DynamoDB Users table
    try:
        resp  = table.scan()
        users = resp.get('Items', [])
        # handle pagination
        while 'LastEvaluatedKey' in resp:
            resp  = table.scan(ExclusiveStartKey=resp['LastEvaluatedKey'])
            users.extend(resp.get('Items', []))

        # 5) Return the full list
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(users)
        }

    except ClientError as e:
        logger.error("DynamoDB scan failed", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error listing users',
                'error': str(e)
            })
        }
