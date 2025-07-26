import os
import zipfile
import boto3

LAMBDA_FOLDER = "lambdas"
ROLE_ARN = "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/LabRole"  # 🔁 Replace with your actual role
RUNTIME = "python3.11"
REGION = "us-east-1"  # change if needed

lambda_client = boto3.client("lambda", region_name=REGION)

def zip_lambda(file_path, function_name):
    zip_name = f"{function_name}.zip"
    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(file_path, arcname="handler.py")  # rename to handler.py inside zip
    return zip_name

def upload_lambda(function_name, zip_path):
    with open(zip_path, "rb") as f:
        zip_bytes = f.read()

    try:
        lambda_client.update_function_code(
            FunctionName=function_name,
            ZipFile=zip_bytes,
            Publish=True
        )
        print(f"✅ Updated Lambda: {function_name}")
    except lambda_client.exceptions.ResourceNotFoundException:
        lambda_client.create_function(
            FunctionName=function_name,
            Runtime=RUNTIME,
            Role=ROLE_ARN,
            Handler="handler.lambda_handler",  # assumes main entry point is `lambda_handler`
            Code={"ZipFile": zip_bytes},
            Timeout=10,
            MemorySize=128,
            Publish=True
        )
        print(f"🚀 Created Lambda: {function_name}")
    os.remove(zip_path)

def main():
    for file in os.listdir(LAMBDA_FOLDER):
        if file.endswith(".py"):
            file_path = os.path.join(LAMBDA_FOLDER, file)
            function_name = file.replace(".py", "")
            print(f"📦 Deploying Lambda: {function_name}")
            zip_file = zip_lambda(file_path, function_name)
            upload_lambda(function_name, zip_file)

if __name__ == "__main__":
    main()
# This script is used to deploy AWS Lambda functions from Python files in the specified folder.