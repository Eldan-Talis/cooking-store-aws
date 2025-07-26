import os
import json
import time
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('RECIPES_TABLE','Recipes')
table      = dynamodb.Table(TABLE_NAME)

MAX_RETRIES = 5

def lambda_handler(event, context):
    # parse request
    data = json.loads(event.get('body') or '{}')
    for f in ('Title','InstructionsText','CreatedByUserId'):
        if not data.get(f):
            return {'statusCode':400,'body':json.dumps({'message':f'Missing {f}'})}

    for attempt in range(MAX_RETRIES):
        # 1) find current max id
        scan = table.scan(ProjectionExpression='Id')
        ids = [int(item['Id']) for item in scan.get('Items',[]) if item['Id'].isdigit()]
        max_id = max(ids) if ids else 0
        new_id = str(max_id + 1)

        # 2) build recipe
        item = {
            'Id': new_id,
            'CategoryId': data.get('CategoryId',''),
            'Couisine': data.get('Couisine',''),
            'CreatedByUserId': data['CreatedByUserId'],
            'GlutenFree': data.get('GlutenFree','NULL'),
            'ImageUrl': data.get('ImageUrl',''),
            'InstructionsText': data['InstructionsText'],
            'Publisher': data.get('Publisher',''),
            'SourceUrl': data.get('SourceUrl',''),
            'Summery': data.get('Summery',''),
            'Title': data['Title'],
            'Vegan': data.get('Vegan','NULL'),
            'Vegetarian': data.get('Vegetarian','NULL'),
            'CreatedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }

        # 3) attempt conditional write
        try:
            table.put_item(
                Item=item,
                ConditionExpression='attribute_not_exists(Id)'
            )
            # success!
            return {
                'statusCode': 201,
                'headers': {'Content-Type':'application/json'},
                'body': json.dumps(item)
            }
        except ClientError as e:
            if e.response['Error']['Code']=='ConditionalCheckFailedException':
                # someone else took that Id—retry
                continue
            else:
                # other error
                raise

    # if we get here, too many retries
    return {
      'statusCode': 500,
      'body': json.dumps({'message':'Could not allocate new Id; please retry'})  
    }
