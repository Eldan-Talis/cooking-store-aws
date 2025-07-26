import os
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('RECIPES_TABLE', 'Recipes')
table      = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    # 1) Extract userId from either pathParameters or queryString
    user_id = None
    if event.get('pathParameters', {}).get('user-id'):
        user_id = event['pathParameters']['user-id']
    elif event.get('queryStringParameters', {}).get('user-id'):
        user_id = event['queryStringParameters']['user-id']

    if not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Missing userId'})
        }

    try:
        # 2) If you have a GSI on CreatedByUserId:
        # resp = table.query(
        #     IndexName='CreatedByUserId-index',
        #     KeyConditionExpression=Key('CreatedByUserId').eq(user_id)
        # )

        # Otherwise fall back to a scan + filter (OK for small tables):
        resp = table.scan(
            FilterExpression=Attr('CreatedByUserId').eq(user_id)
        )

        items = resp.get('Items', [])
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error fetching user recipes',
                'error': str(e)
            })
        }

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(items)
    }
