#!/bin/bash

# --- Configuration ---
AWS_REGION="us-west-2"
S3_BUCKET_NAME="africatennisbucket"
STACK_NAME="africa-tennis-platform-stack"
SUPABASE_URL="https://ppuqbimzeplznqdchvve.supabase.co"
FRONTEND_URL="www.africatennis.com"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdXFiaW16ZXBsem5xZGNodnZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYzNzI2MSwiZXhwIjoyMDY1MjEzMjYxfQ.NEfWLgVkb98xlApZ1T6ZeDkh5stIH1rnfs_-bJwYx0U"
SES_EMAIL_SOURCE="info@africatennis.com"

# Load AWS credentials
if [ -f "aws/credentials.json" ]; then
  echo "Loading AWS credentials from aws/credentials.json"
  export AWS_ACCESS_KEY_ID=$(grep -o '"accessKeyId": "[^"]*' aws/credentials.json | cut -d '"' -f 4)
  export AWS_SECRET_ACCESS_KEY=$(grep -o '"secretAccessKey": "[^"]*' aws/credentials.json | cut -d '"' -f 4)
  export AWS_DEFAULT_REGION=$(grep -o '"region": "[^"]*' aws/credentials.json | cut -d '"' -f 4)
else
  echo "Error: aws/credentials.json not found"
  exit 1
fi

echo "[STEP 1/4] Cleaning up previous build artifacts..."
rm -rf dist
rm -rf .aws-sam
echo ""

echo "[STEP 2/4] Installing dependencies and compiling TypeScript..."
cd aws
npm install
npm run build
echo "[SUCCESS] Build complete."
echo ""

echo "[STEP 3/4] Copying dependencies to each Lambda function directory..."
for d in dist/lambdas/*/ ; do
  echo "Copying node_modules to $d..."
  cp -r node_modules "$d"
done
echo "[SUCCESS] Dependencies copied."
echo ""

echo "[STEP 4/4] Packaging and deploying the application..."
sam package \
  --template-file template.yaml \
  --output-template-file packaged.yaml \
  --s3-bucket "$S3_BUCKET_NAME"

sam deploy \
  --template-file packaged.yaml \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --region "$AWS_REGION" \
  --parameter-overrides \
    SupabaseUrl="$SUPABASE_URL" \
    SupabaseServiceRoleKey="$SUPABASE_SERVICE_ROLE_KEY" \
    FrontendUrl="$FRONTEND_URL" \
    SesEmailSource="$SES_EMAIL_SOURCE" \
  --no-confirm-changeset

echo ""
echo "[SUCCESS] Deployment is complete! Your application should now be working."