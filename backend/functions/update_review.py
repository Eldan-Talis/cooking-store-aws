# file: update_review.py
import json, os, boto3, datetime
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

TABLE = boto3.resource("dynamodb").Table("Reviews")

def lambda_handler(event, _):
    """Handle PUT /Recipes/{recipeId}/Review"""
    if event.get("httpMethod", "") == "OPTIONS":
        return _cors(200, "OK")           # CORS pre-flight

    if event.get("httpMethod") != "PUT":
        return _cors(405, {"error": "Method not allowed"})

    # ---- Auth ----
    claims = (
        event.get("requestContext", {})
             .get("authorizer", {})
             .get("claims", {})
    )
    if not claims or "sub" not in claims:
        return _cors(401, {"error": "Unauthenticated"})

    user_id  = claims["sub"]
    username = claims.get("cognito:username") or claims.get("username")

    # ---- Path & body ----
    recipe_id = event["pathParameters"].get("recipeId")
    body      = json.loads(event.get("body") or "{}")
    new_text  = body.get("ReviewText", "").strip()

    if not new_text:
        return _cors(400, {"error": "ReviewText required"})

    # ---- Locate existing review (one per user per recipe) ----
    try:
        query = TABLE.query(
            KeyConditionExpression=Key("RecipeId").eq(recipe_id),
            FilterExpression=Attr("UserId").eq(user_id),
            Limit=1,                      # there should be at most one
        )
    except ClientError as err:
        print("Dynamo query failed:", err)
        return _cors(500, {"error": "Internal error"})

    if not query.get("Items"):
        # User never posted a review for this recipe
        return _cors(404, {"error": "Review not found"})

    item = query["Items"][0]
    created_at = item["CreatedAt"]            # the sort key

    # ---- Update the review text ----
    updated_at = datetime.datetime.utcnow() \
                                .isoformat(timespec="milliseconds") + "Z"

    try:
        TABLE.update_item(
            Key={"RecipeId": recipe_id, "CreatedAt": created_at},
            UpdateExpression="SET ReviewText = :t, UpdatedAt = :u",
            ConditionExpression=Attr("UserId").eq(user_id),
            ExpressionAttributeValues={
                ":t": new_text,
                ":u": updated_at,
            },
            ReturnValues="ALL_NEW",
        )
    except ClientError as err:
        if err.response["Error"]["Code"] == "ConditionalCheckFailedException":
            # Item vanished or belongs to someone else
            return _cors(404, {"error": "Review not found"})
        print("Update failed:", err)
        return _cors(500, {"error": "Internal error"})

    response_payload = {
        "RecipeId": recipe_id,
        "UserId":   user_id,
        "Username": username,
        "ReviewText": new_text,
        "CreatedAt":  created_at,
        "UpdatedAt":  updated_at,
    }
    return _cors(200, response_payload)


# ---------------------------------------------------------------------------
def _cors(status: int, body):
    """Uniform response with CORS headers"""
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        },
        "body": json.dumps(body),
    }
