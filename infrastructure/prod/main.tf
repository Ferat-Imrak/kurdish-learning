# Production Environment - Production-ready infrastructure
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Configure backend after manually creating S3 bucket and DynamoDB table
  # Replace ACCOUNT_ID with your AWS account ID
  backend "s3" {
    bucket         = "peyvi-dev-terraform-state-634347876978"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "peyvi-dev-terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "prod"
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

# Get AWS Account ID
data "aws_caller_identity" "current" {}

# Get Availability Zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Terraform State Backend (must be created first)
module "terraform_state" {
  source = "../modules/terraform-state"

  project_name   = var.project_name
  environment    = "prod"
  aws_account_id = data.aws_caller_identity.current.account_id
}

# VPC Module
module "vpc" {
  source = "../modules/vpc"

  project_name         = var.project_name
  environment          = "prod"
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = slice(data.aws_availability_zones.available.names, 0, 2)
  enable_nat_gateway   = true # Enable NAT for production
}

# Security Group for Application
resource "aws_security_group" "app" {
  name        = "${var.project_name}-prod-app-sg"
  description = "Security group for application servers"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTP from ALB"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-prod-app-sg"
  }
}

# RDS Module
module "rds" {
  source = "../modules/rds"

  project_name           = var.project_name
  environment            = "prod"
  vpc_id                 = module.vpc.vpc_id
  subnet_ids             = module.vpc.private_subnet_ids
  app_security_group_id  = aws_security_group.app.id
  database_name          = var.database_name
  database_username      = var.database_username
  database_password      = var.database_password
  instance_class         = "db.t3.small" # Slightly larger for prod
  allocated_storage      = 50
  max_allocated_storage  = 200
  backup_retention_period = 7
}

# Route 53 Hosted Zone (if domain is provided)
data "aws_route53_zone" "main" {
  count = var.domain_name != "" ? 1 : 0
  name  = var.domain_name
}

# Provider for us-east-1 (required for CloudFront certificates)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# ACM Certificate - create only if domain is provided
resource "aws_acm_certificate" "main" {
  count             = var.domain_name != "" ? 1 : 0
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-prod-cert"
    Environment = "prod"
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Certificate validation records
resource "aws_route53_record" "cert_validation" {
  for_each = var.domain_name != "" ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main[0].zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "main" {
  count           = var.domain_name != "" ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [
    for record in aws_route53_record.cert_validation : record.fqdn
  ]

  timeouts {
    create = "5m"
  }
}

# S3 + CloudFront Module
module "frontend" {
  source = "../modules/s3-cloudfront"

  project_name        = var.project_name
  environment         = "prod"
  aws_account_id      = data.aws_caller_identity.current.account_id
  domain_name         = var.domain_name
  acm_certificate_arn = var.domain_name != "" && length(aws_acm_certificate_validation.main) > 0 ? aws_acm_certificate_validation.main[0].certificate_arn : ""
  price_class         = "PriceClass_All" # Global distribution for prod
}

# Route 53 Record for CloudFront
resource "aws_route53_record" "frontend" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.frontend.cloudfront_domain_name
    zone_id                = "Z2FDTNDATAQYW2" # CloudFront hosted zone ID (constant)
    evaluate_target_health = false
  }
}

# Reference to CloudFront distribution (needed for Route 53)
data "aws_cloudfront_distribution" "frontend" {
  id = module.frontend.cloudfront_distribution_id
}

# Secrets Manager for sensitive data
resource "aws_secretsmanager_secret" "database" {
  name        = "${var.project_name}/prod/database"
  description = "Database credentials for prod environment"

  tags = {
    Name = "${var.project_name}-prod-db-secret"
  }
}

resource "aws_secretsmanager_secret_version" "database" {
  secret_id = aws_secretsmanager_secret.database.id
  secret_string = jsonencode({
    username = var.database_username
    password = var.database_password
    host     = module.rds.db_instance_address
    port     = module.rds.db_instance_port
    database = var.database_name
  })
}

# SES Configuration (for email)
resource "aws_ses_email_identity" "noreply" {
  email = "noreply@${var.domain_name}"
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/${var.project_name}/prod/app"
  retention_in_days = 30 # Longer retention for prod

  tags = {
    Name = "${var.project_name}-prod-app-logs"
  }
}

