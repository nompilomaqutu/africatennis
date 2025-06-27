@echo off
setlocal

REM --- Configuration ---
set "AWS_REGION=us-east-1"
set "S3_BUCKET_NAME=africa-tennis-artifacts-nathi-2025"
set "STACK_NAME=africa-tennis-platform-stack"
set "SUPABASE_URL=https://ppuqbimzeplznqdchvve.supabase.co"
set "FRONTEND_URL=https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--858c0e43.local-credentialless.webcontainer-api.io"
set "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdXFiaW16ZXBsem5xZGNodnZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYzNzI2MSwiZXhwIjoyMDY1MjEzMjYxfQ.NEfWLgVkb98xlApZ1T6ZeDkh5stIH1rnfs_-bJwYx0U"
set "SES_EMAIL_SOURCE=noreply@africatennis.com"

echo [STEP 1/4] Cleaning up previous build artifacts...
if exist dist rmdir /s /q dist
if exist .aws-sam rmdir /s /q .aws-sam
echo.

echo [STEP 2/4] Installing dependencies and compiling TypeScript...
call npm install
call tsc
echo [SUCCESS] Build complete.
echo.

echo [STEP 3/4] Copying dependencies to each Lambda function directory...
FOR /d %%d IN (dist\lambdas\*) DO (
    echo Copying node_modules to %%d...
    xcopy node_modules %%d\node_modules\ /s /e /i /q /y
)
echo [SUCCESS] Dependencies copied.
echo.

echo [STEP 4/4] Packaging and deploying the application...
call sam package ^
  --template-file template.yaml ^
  --output-template-file packaged.yaml ^
  --s3-bucket "%S3_BUCKET_NAME%"

call sam deploy ^
  --template-file packaged.yaml ^
  --stack-name "%STACK_NAME%" ^
  --capabilities CAPABILITY_IAM ^
  --region "%AWS_REGION%" ^
  --parameter-overrides ^
    SupabaseUrl="%SUPABASE_URL%" ^
    SupabaseServiceRoleKey="%SUPABASE_SERVICE_ROLE_KEY%" ^
    FrontendUrl="%FRONTEND_URL%" ^
    SesEmailSource="%SES_EMAIL_SOURCE%" ^
  --no-confirm-changeset

echo.
echo [SUCCESS] Deployment is complete! Your application should now be working.

endlocal
pause
