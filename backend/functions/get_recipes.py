import json
import boto3

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Recipes')

    # Get optional pagination key
    last_key = event.get("queryStringParameters", {}).get("lastKey")

    # Build scan params
    scan_kwargs = {"Limit": 10}
    if last_key:
        scan_kwargs["ExclusiveStartKey"] = { "Id": last_key }  # adjust to your PK

    response = table.scan(**scan_kwargs)
    items = response.get('Items', [])
    last_evaluated_key = response.get('LastEvaluatedKey')

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'items': items,
            'lastKey': last_evaluated_key["Id"] if last_evaluated_key else None
        })
    }
