# Deploy Frontend to AWS

After running `terraform apply`, you need to deploy your frontend code to S3.
cloudfront_distribution_id = "EA9TQAL6BKXWA"
database_endpoint = <sensitive>
database_name = "kurdish_learning"
frontend_s3_bucket = "peyvi-prod-frontend-634347876978"
frontend_url = "https://peyvi.com"
terraform_state_bucket = "peyvi-prod-terraform-state-634347876978"
vpc_id = "vpc-042aa97b0b931f4c2"
## Step 1: Get S3 Bucket Name

```bash
cd infrastructure/prod
terraform output frontend_s3_bucket
```

This will show the S3 bucket name (e.g., `peyvi-prod-frontend-ACCOUNT_ID`)

## Step 2: Build Frontend

```bash
cd ../../frontend
npm run build
```

This creates the `out/` directory with static files.

## Step 3: Upload to S3

```bash
# Replace BUCKET_NAME with the output from Step 1
aws s3 sync out/ s3://peyvi-prod-frontend-634347876978/ --delete
```

The `--delete` flag removes old files that no longer exist.

## Step 4: Invalidate CloudFront Cache

```bash
# Get CloudFront distribution ID
cd ../infrastructure/prod
terraform output cloudfront_distribution_id

# Invalidate cache (replace DISTRIBUTION_ID)
aws cloudfront create-invalidation \
  --distribution-id EA9TQAL6BKXWA \
  --paths "/*"
```

## Step 5: Wait for CloudFront

- CloudFront deployment: ~15 minutes
- Cache invalidation: ~5 minutes

## Step 6: Check DNS

Terraform should have created the Route 53 record pointing peyvi.com to CloudFront. Verify:

```bash
dig peyvi.com
# Should show CloudFront IP addresses
```

## Quick Deploy Script

Save this as `deploy-frontend.sh`:

```bash
#!/bin/bash
set -e

echo "📦 Building frontend..."
cd frontend
npm run build

echo "📤 Getting S3 bucket name..."
cd ../infrastructure/prod
BUCKET=$(terraform output -raw frontend_s3_bucket)
DIST_ID=$(terraform output -raw cloudfront_distribution_id)

echo "🚀 Uploading to S3: $BUCKET"
cd ../../frontend
aws s3 sync out/ s3://$BUCKET/ --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*" \
  --output json | jq -r '.Invalidation.Id'

echo "✅ Deployment complete!"
echo "⏳ Wait ~15 minutes for CloudFront to deploy, then visit https://peyvi.com"
```

Make it executable:
```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

## Troubleshooting

**If peyvi.com doesn't work:**
1. Check Route 53 record exists: `aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID`
2. Check CloudFront distribution status: `aws cloudfront get-distribution --id DIST_ID`
3. Verify S3 bucket has files: `aws s3 ls s3://BUCKET_NAME/`
4. Check DNS propagation: `dig peyvi.com`

