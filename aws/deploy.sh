#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- Configuration ---
AWS_REGION="us-west-2"
S3_BUCKET_NAME="africatennisbucket"
STACK_NAME="africa-tennis-platform-stack"
SUPABASE_URL="https://ppuqbimzeplznqdchvve.supabase.co"
FRONTEND_URL="www.africatennis.com"
SES_EMAIL_SOURCE="info@africatennis.com"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed.${NC}"
    echo "Please install AWS CLI first: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${YELLOW}Warning: AWS credentials not properly configured.${NC}"
    echo "Please ensure you have configured your AWS credentials using:"
    echo "  aws configure"
    echo "Or set the following environment variables:"
    echo "  export AWS_ACCESS_KEY_ID=your_access_key"
    echo "  export AWS_SECRET_ACCESS_KEY=your_secret_key"
    echo "  export AWS_REGION=your_region (e.g., us-east-1)"
    exit 1
fi

# Check if Supabase service role key is provided
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${YELLOW}Warning: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.${NC}"
    echo "Please set it before running this script:"
    echo "  export SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    
    # Use the key from the bat file as fallback
    SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdXFiaW16ZXBsem5xZGNodnZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYzNzI2MSwiZXhwIjoyMDY1MjEzMjYxfQ.NEfWLgVkb98xlApZ1T6ZeDkh5stIH1rnfs_-bJwYx0U"
    echo -e "${YELLOW}Using fallback service role key from configuration.${NC}"
fi

echo -e "${GREEN}[STEP 1/4] Cleaning up previous build artifacts...${NC}"
if [ -d "dist" ]; then
    rm -rf dist
fi
if [ -d ".aws-sam" ]; then
    rm -rf .aws-sam
fi
echo ""

echo -e "${GREEN}[STEP 2/4] Installing dependencies and compiling TypeScript...${NC}"
npm install
npx tsc
echo -e "${GREEN}[SUCCESS] Build complete.${NC}"
echo ""

echo -e "${GREEN}[STEP 3/4] Copying dependencies to each Lambda function directory...${NC}"
for d in dist/lambdas/*/ ; do
    echo "Copying node_modules to $d..."
    cp -r node_modules "$d"
done
echo -e "${GREEN}[SUCCESS] Dependencies copied.${NC}"
echo ""

echo -e "${GREEN}[STEP 4/4] Packaging and deploying the application...${NC}"
# Check if S3 bucket exists, create if it doesn't
if ! aws s3 ls "s3://$S3_BUCKET_NAME" 2>&1 > /dev/null; then
    echo "Creating S3 bucket: $S3_BUCKET_NAME"
    aws s3 mb "s3://$S3_BUCKET_NAME" --region "$AWS_REGION"
fi

# Package the application
echo "Packaging application..."
aws cloudformation package \
  --template-file template.yaml \
  --output-template-file packaged.yaml \
  --s3-bucket "$S3_BUCKET_NAME" \
  --region "$AWS_REGION"

# Deploy the application
echo "Deploying application..."
aws cloudformation deploy \
  --template-file packaged.yaml \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_IAM \
  --region "$AWS_REGION" \
  --parameter-overrides \
    SupabaseUrl="$SUPABASE_URL" \
    SupabaseServiceRoleKey="$SUPABASE_SERVICE_ROLE_KEY" \
    FrontendUrl="$FRONTEND_URL" \
    SesEmailSource="$SES_EMAIL_SOURCE" \
  --no-fail-on-empty-changeset

echo ""
echo -e "${GREEN}[SUCCESS] Deployment is complete! Your application should now be working.${NC}"
echo ""
echo "To check the deployment status, run:"
echo "  ./aws/check-deployment.sh"
echo ""
echo "API Gateway URL:"
aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text