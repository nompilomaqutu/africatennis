#!/bin/bash

# Load AWS credentials
if [ -f "aws/credentials.json" ]; then
  echo "Loading AWS credentials from aws/credentials.json"
  export AWS_ACCESS_KEY_ID=$(grep -o '"accessKeyId": "[^"]*' aws/credentials.json | cut -d '"' -f 4)
  export AWS_SECRET_ACCESS_KEY=$(grep -o '"secretAccessKey": "[^"]*' aws/credentials.json | cut -d '"' -f 4)
  export AWS_DEFAULT_REGION="us-west-2"
else
  echo "Error: aws/credentials.json not found"
  exit 1
fi

# Set stack name
STACK_NAME="africa-tennis-platform-stack"

echo "Checking deployment status for stack: $STACK_NAME"
echo "----------------------------------------------"

# Check CloudFormation stack status
echo "CloudFormation Stack Status:"
aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].StackStatus" --output text

# Get API Gateway endpoint
echo -e "\nAPI Gateway Endpoint:"
aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text

# List Lambda functions in the stack
echo -e "\nLambda Functions:"
aws cloudformation list-stack-resources --stack-name $STACK_NAME --query "StackResourceSummaries[?ResourceType=='AWS::Lambda::Function'].{LogicalResourceId:LogicalResourceId, PhysicalResourceId:PhysicalResourceId, Status:ResourceStatus}" --output table

# Check recent Lambda invocations (last 10 minutes)
echo -e "\nRecent Lambda Invocations (last 10 minutes):"
FUNCTIONS=$(aws cloudformation list-stack-resources --stack-name $STACK_NAME --query "StackResourceSummaries[?ResourceType=='AWS::Lambda::Function'].PhysicalResourceId" --output text)

for func in $FUNCTIONS; do
  echo "Function: $func"
  aws logs filter-log-events --log-group-name "/aws/lambda/$func" --start-time $(( $(date +%s) - 600 ))000 --query "events[].message" --output text | head -n 10
  echo ""
done

echo "----------------------------------------------"
echo "Deployment check complete!"