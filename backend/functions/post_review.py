import json, os, boto3, datetime
from boto3.dynamodb.conditions import Key

TABLE = boto3.resource("dynamodb").Table("Reviews")

def lambda_handler(event, _):
    # ---------- CORS pre-flight ----------
    if event.get("httpMethod") == "OPTIONS":
        return _cors(200, "OK")

    # ---------- auth ----------
    claims = (event.get("requestContext", {})
                    .get("authorizer", {})
                    .get("claims", {}))      # HTTP API
    if not claims or "sub" not in claims:
        return _cors(401, {"error": "Unauthenticated"})

    user_id   = claims["sub"]
    username  = claims.get("cognito:username") or claims.get("username")
    recipe_id = event["pathParameters"]["recipeId"]
    body      = json.loads(event["body"] or "{}")
    text      = body.get("ReviewText")

    if not text:
        return _cors(400, {"error": "ReviewText required"})

    now = datetime.datetime.utcnow().isoformat(timespec="milliseconds") + "Z"

    item = {
        "RecipeId": recipe_id,
        "CreatedAt": now,
        "UserId": user_id,
        "Username": username,
        "ReviewText": text,
    }
    TABLE.put_item(Item=item)

    return _cors(201, item)

# ----------------------------------------
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
