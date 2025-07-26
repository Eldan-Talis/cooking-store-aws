import json
import os
import urllib.request
import urllib.error

# Read your API key from Lambda environment variables
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]

def lambda_handler(event, context):
    """POST body: { "message": "your text" }  →  { "reply": "Gemini answer" }"""
    
    body = json.loads(event.get("body") or "{}")
    message = body.get("message", "").strip()

    if not message:
        return _response(400, {"reply": "Empty message"})

    # Build Gemini request
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}",
        method="POST",
        headers={"Content-Type": "application/json"},
        data=json.dumps({
            "contents": [
                {"parts": [{"text": message}]}
            ],
            "generationConfig": {
                "maxOutputTokens": 300      # limit length so Lambda stays fast
            }
        }).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            response_data = json.load(res)
            print("Gemini response:", json.dumps(response_data))   # debug log
    except urllib.error.HTTPError as e:
        print("Gemini request failed:", e)
        return _response(e.code, {"reply": f"Gemini error {e.code}"})
    except Exception as e:
        print("Unexpected error:", e)
        return _response(500, {"reply": "Internal error"})

    # Extract text
    reply = (
        response_data.get("candidates", [{}])[0]
        .get("content", {})
        .get("parts", [{}])[0]
        .get("text", "Sorry, something went wrong.")
        .strip()
    )

    return _response(200, {"reply": reply})


def _response(status_code, body_dict):
    """Helper to add CORS headers."""
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(body_dict),
    }
