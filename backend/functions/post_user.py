import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Users')  # Make sure this is your table name

def lambda_handler(event, context):
    print("Received event:", event)

    # Handle CORS preflight request
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST",
                "Access-Control-Allow-Headers": "Content-Type,Authorization"
            },
            "body": json.dumps("CORS preflight OK")
        }

    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        user_id = claims["sub"]
        email = claims.get("email", "")
        user_name = claims.get("cognito:username", "")

        print(f"Checking for user ID: {user_id}")
        response = table.get_item(Key={"UserID": user_id})
        print("DynamoDB get_item response:", response)

        if response.get("Item"):
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps(f"User {user_id} already exists.")
            }

        table.put_item(Item={
            "UserID": user_id,
            "email": email,
            "user_name": user_name
        })

        print(f"User {user_id} added to Users table.")
        return {
            "statusCode": 201,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(f"User {user_id} created successfully.")
        }

    except Exception as e:
        print("Error occurred:", str(e))
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps("Internal server error")
        }
