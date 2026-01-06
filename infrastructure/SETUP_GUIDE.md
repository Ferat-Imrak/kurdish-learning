# Terraform Setup Guide

## First-Time Setup

### Step 1: Initialize with Local State

Since the S3 backend doesn't exist yet, we'll use local state first:

```bash
cd infrastructure/dev
terraform init
```

This will initialize Terraform with local state (no backend prompt).

### Step 2: Create State Backend

Create only the state backend resources first:

```bash
terraform apply -target=module.terraform_state
```

This creates:
- S3 bucket for state
- DynamoDB table for locking

### Step 3: Get the State Bucket Name

After the apply completes, note the bucket name from the output:

```bash
terraform output terraform_state_bucket
```

### Step 4: Get Your AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
```

### Step 5: Update Backend Configuration

Edit `infrastructure/dev/main.tf` and uncomment/update the backend block:

```hcl
backend "s3" {
  bucket         = "peyvi-dev-terraform-state-YOUR_ACCOUNT_ID"
  key            = "dev/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "peyvi-dev-terraform-state-lock"
}
```

Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID.

### Step 6: Migrate State to S3

```bash
terraform init -migrate-state
```

When prompted, type `yes` to migrate the state.

### Step 7: Apply Full Infrastructure

Now apply all resources:

```bash
terraform apply
```

## Repeat for Production

Follow the same steps in `infrastructure/prod/` directory.

## Quick Commands

```bash
# Initialize
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy (careful!)
terraform destroy
```

