# Manual Backend Setup

Create the Terraform state backend manually before running Terraform.

## Step 1: Get Your AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
```

Save this value - you'll need it for bucket naming.

## Step 2: Create S3 Bucket for State

**For Dev:**
```bash
aws s3 mb s3://peyvi-dev-terraform-state-$(aws sts get-caller-identity --query Account --output text) --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket peyvi-dev-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket peyvi-dev-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket peyvi-dev-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

**For Prod:**
```bash
aws s3 mb s3://peyvi-prod-terraform-state-$(aws sts get-caller-identity --query Account --output text) --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket peyvi-prod-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket peyvi-prod-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket peyvi-prod-terraform-state-$(aws sts get-caller-identity --query Account --output text) \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## Step 3: Create DynamoDB Table for State Locking

**For Dev:**
```bash
aws dynamodb create-table \
  --table-name peyvi-dev-terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

**For Prod:**
```bash
aws dynamodb create-table \
  --table-name peyvi-prod-terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Step 4: Update Terraform Backend Configuration

After creating the resources manually, update the backend block in `main.tf`:

**For Dev (`infrastructure/dev/main.tf`):**
```hcl
backend "s3" {
  bucket         = "peyvi-dev-terraform-state-YOUR_ACCOUNT_ID"
  key            = "dev/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "peyvi-dev-terraform-state-lock"
  encrypt        = true
}
```

**For Prod (`infrastructure/prod/main.tf`):**
```hcl
backend "s3" {
  bucket         = "peyvi-prod-terraform-state-YOUR_ACCOUNT_ID"
  key            = "prod/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "peyvi-prod-terraform-state-lock"
  encrypt        = true
}
```

Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID.

## Step 5: Initialize Terraform

```bash
cd infrastructure/dev  # or prod
terraform init
```

## Step 6: Remove State Backend Module (Optional)

Since you created the backend manually, you can remove the `terraform_state` module from `main.tf` to avoid conflicts, or keep it commented out.

## Quick Script

Save this as `setup-backend.sh`:

```bash
#!/bin/bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ENV=$1  # dev or prod

# Create S3 bucket
aws s3 mb s3://peyvi-${ENV}-terraform-state-${ACCOUNT_ID} --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket peyvi-${ENV}-terraform-state-${ACCOUNT_ID} \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket peyvi-${ENV}-terraform-state-${ACCOUNT_ID} \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# Block public access
aws s3api put-public-access-block \
  --bucket peyvi-${ENV}-terraform-state-${ACCOUNT_ID} \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Create DynamoDB table
aws dynamodb create-table \
  --table-name peyvi-${ENV}-terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

echo "Backend created for ${ENV} environment"
echo "Bucket: peyvi-${ENV}-terraform-state-${ACCOUNT_ID}"
echo "DynamoDB: peyvi-${ENV}-terraform-state-lock"
```

Run: `bash setup-backend.sh dev` or `bash setup-backend.sh prod`

