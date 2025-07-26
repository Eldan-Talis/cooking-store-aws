import json
import boto3

dynamodb = boto3.resource('dynamodb')
fav_tbl = dynamodb.Table('Favorites')

def lambda_handler(event, context):
    print("RAW EVENT:", json.dumps(event))

    if event.get("httpMethod") == "OPTIONS":
        return cors_response(200, "OK")

    authorizer = event.get("requestContext", {}).get("authorizer", {})
    claims = authorizer.get("claims") or authorizer.get("jwt", {}).get("claims")
    if not claims or "sub" not in claims:
        return cors_response(401, {"error": "No auth claims"})

    user_id = claims["sub"]

    try:
        body = json.loads(event.get("body", "{}"))
        recipe_id = body.get("RecipeId")

        if not recipe_id:
            return cors_response(400, {"error": "Missing RecipeId"})

        # Remove from string set
        fav_tbl.update_item(
            Key={"UserID": user_id},
            UpdateExpression="DELETE RecipeIDs :r",
            ExpressionAttributeValues={":r": {str(recipe_id)}}
        )

        return cors_response(200, {"message": f"Recipe {recipe_id} removed from favorites."})

    except Exception as e:
        print("Delete error:", e)
        return cors_response(500, {"error": "Internal error"})

def cors_response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE",
            "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        "body": json.dumps(body)
    }
