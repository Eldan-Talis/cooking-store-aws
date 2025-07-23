import json, os, boto3
from boto3.dynamodb.conditions import Key

TABLE = boto3.resource("dynamodb").Table("Reviews")

def lambda_handler(event, _):
    if event.get("httpMethod") == "OPTIONS":
        return _cors(200, "OK")

    recipe_id = event["pathParameters"]["recipeId"]

    resp = TABLE.query(
        KeyConditionExpression=Key("RecipeId").eq(recipe_id),
        ScanIndexForward=False,   # newest first
        Limit=100                 # protection vs. hot partitions
    )

    return _cors(200, resp.get("Items", []))

def _cors(code, body):
    return {
        "statusCode": code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(body),
    }
