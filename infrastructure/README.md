# Peyvi Infrastructure as Code

Terraform configuration for deploying Peyvi to AWS with cost optimization.

## Structure

```
infrastructure/
├── modules/           # Reusable modules
│   ├── vpc/          # VPC, subnets, NAT gateway
│   ├── rds/          # PostgreSQL database
│   ├── s3-cloudfront/ # Frontend hosting
│   └── terraform-state/ # State backend
├── dev/              # Development environment
└── prod/             # Production environment
```

## Prerequisites

1. **AWS CLI configured**
   ```bash
   aws configure
   ```

2. **Terraform installed** (>= 1.0)
   ```bash
   brew install terraform  # macOS
   # or download from https://www.terraform.io/downloads
   ```

3. **AWS Account** with appropriate permissions

## Quick Start

### 1. Configure Variables

**For Dev:**
```bash
cd infrastructure/dev
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

**For Prod:**
```bash
cd infrastructure/prod
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 2. Initialize Terraform

```bash
cd infrastructure/dev  # or prod
terraform init
```

### 3. Create State Backend (First Time Only)

The first time, you need to create the state backend manually or use local state:

```bash
# Option 1: Use local state first, then migrate
terraform init -backend=false
terraform apply -target=module.terraform_state
# Then update backend config in main.tf and re-init
terraform init -migrate-state
```

### 4. Plan Changes

```bash
terraform plan
```

### 5. Apply Infrastructure

```bash
terraform apply
```

## Cost Optimization Features

- **Dev Environment:**
  - NAT Gateway disabled (saves ~$32/month)
  - db.t3.micro instance (~$15/month)
  - Shorter backup retention (3 days)
  - CloudFront PriceClass_100 (US/Canada/Europe only)

- **Prod Environment:**
  - NAT Gateway enabled (for security)
  - db.t3.small instance (~$30/month)
  - 7-day backup retention
  - CloudFront PriceClass_All (global)

## Estimated Monthly Costs

**Dev:** ~$25-35/month
- RDS: $15
- S3: $1
- CloudFront: $1
- Other: $8-18

**Prod:** ~$50-70/month
- RDS: $30
- NAT Gateway: $32
- S3: $1
- CloudFront: $2
- Other: $5-15

## Services Created

1. **VPC** - Network infrastructure
2. **RDS PostgreSQL** - Database
3. **S3 + CloudFront** - Frontend hosting
4. **Secrets Manager** - Secure credential storage
5. **SES** - Email service
6. **CloudWatch** - Logging
7. **Route 53** - DNS (prod only)
8. **ACM** - SSL certificates

## Naming Convention

All resources follow this pattern:
- `{project_name}-{environment}-{resource_type}-{identifier}`
- Example: `peyvi-dev-rds-sg`, `peyvi-prod-frontend-cdn`

## Security Best Practices

- ✅ Secrets stored in AWS Secrets Manager
- ✅ Database in private subnets
- ✅ Security groups with least privilege
- ✅ S3 buckets with encryption
- ✅ CloudFront with HTTPS only
- ✅ State files encrypted in S3

## CI/CD Integration

See `.github/workflows/` for GitHub Actions pipelines that:
- Run `terraform plan` on PRs
- Run `terraform apply` on merge (with approval for prod)

## Troubleshooting

### State Lock Issues
```bash
# If state is locked, check DynamoDB table
aws dynamodb scan --table-name peyvi-dev-terraform-state-lock
```

### Backend Configuration
After first apply, update `backend "s3"` block in `main.tf` with actual values.

## Next Steps

1. Set up CI/CD pipelines
2. Configure ECS/EC2 for backend deployment
3. Set up monitoring and alerts
4. Configure backup policies

