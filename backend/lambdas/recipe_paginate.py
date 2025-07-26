import os
import json
import base64
import boto3
from boto3.dynamodb.conditions import Key  # not used now, but handy for queries

dynamodb = boto3.resource("dynamodb")
table     = dynamodb.Table("Recipes")

# ---------- helpers ----------------------------------------------------------
def cors_response(code: int, body):
    """Return a response with CORS headers."""
    return {
        "statusCode": code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body),
    }

def encode_key(key: dict | None) -> str | None:
    """Base64-encode the LastEvaluatedKey so it’s safe in a URL."""
    if key is None:
        return None
    return base64.urlsafe_b64encode(json.dumps(key).encode()).decode()

def decode_key(token: str | None) -> dict | None:
    """Decode the key sent back by the client; returns None if empty/invalid."""
    if not token:
        return None
    try:
        raw = base64.urlsafe_b64decode(token.encode()).decode()
        return json.loads(raw)
    except Exception:
        # Don’t break the function if the token is malformed
        return None

# ---------- Lambda handler ---------------------------------------------------
def lambda_handler(event, context):
    # 1) Handle pre-flight CORS
    if event.get("httpMethod") == "OPTIONS":
        return cors_response(200, "")

    # 2) Parse query parameters
    qs          = event.get("queryStringParameters") or {}
    last_key_in = decode_key(qs.get("lastKey"))
    page_size   = int(qs.get("pageSize", 10))           # default 20 items/page

    # 3) Scan (or Query) with pagination
    scan_kwargs = {
        "Limit": page_size,
    }
    if last_key_in:
        scan_kwargs["ExclusiveStartKey"] = last_key_in

    response     = table.scan(**scan_kwargs)            # use .query() if PK/LSI
    items        = response.get("Items", [])
    last_key_out = encode_key(response.get("LastEvaluatedKey"))

    # 4) Build payload expected by the front end
    payload = {
        "items": items,
        "lastKey": last_key_out,    # null when no more pages
    }

    return cors_response(200, payload)
