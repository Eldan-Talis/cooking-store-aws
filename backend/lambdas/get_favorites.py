import json
import boto3
import traceback
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.types import TypeDeserializer

dynamodb      = boto3.resource('dynamodb')
fav_tbl       = dynamodb.Table('Favorites')
dynamo_client = boto3.client('dynamodb')

RECIPES_TABLE = "Recipes"  # Change to env var if needed
deserializer  = TypeDeserializer()

def lambda_handler(event, context):
    # CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return cors_response(200, "")

    # Extract auth claims
    auth    = event.get("requestContext", {}).get("authorizer", {})
    claims  = auth.get("claims") or auth.get("jwt", {}).get("claims", {})
    user_id = claims.get("sub")
    if not user_id:
        return cors_response(401, {"error": "Missing auth claims"})

    try:
        # Get user's favorite(s)
        fav_resp = fav_tbl.query(
            KeyConditionExpression=Key("UserID").eq(user_id)
        )
        items = fav_resp.get("Items", [])
        if not items:
            return cors_response(200, [])

        # Flatten all RecipeIDs from each item
        recipe_ids = []
        for item in items:
            ids = item.get("RecipeIDs")
            if isinstance(ids, (list, set, tuple)):
                recipe_ids.extend(map(str, ids))
            elif ids:
                recipe_ids.append(str(ids))

        # Deduplicate
        recipe_ids = list(set(recipe_ids))
        if not recipe_ids:
            return cors_response(200, [])

        # Build keys for batch_get_item (max 100 per call)
        keys = [{"Id": {"S": rid}} for rid in recipe_ids]
        all_recipes = []

        # DynamoDB batch_get_item supports max 100 items per call
        for i in range(0, len(keys), 100):
            batch = keys[i:i+100]
            resp = dynamo_client.batch_get_item(
                RequestItems={RECIPES_TABLE: {"Keys": batch}}
            )
            raw_items = resp["Responses"].get(RECIPES_TABLE, [])
            deserialized = [
                {k: deserializer.deserialize(v) for k, v in item.items()}
                for item in raw_items
            ]
            all_recipes.extend(deserialized)

        return cors_response(200, all_recipes)

    except Exception:
        print("Favorites fetch error:")
        traceback.print_exc()
        return cors_response(500, {"error": "Internal server error"})


def cors_response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET",
            "Access-Control-Allow-Headers": "Content-Type,Authorization"
        },
        "body": json.dumps(body)
    }
