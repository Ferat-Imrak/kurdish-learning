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
    bucket         = "peyvi-prod-terraform-state-634347876978"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "peyvi-prod-terraform-state-lock"
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

locals {
  database_url = "postgresql://${var.database_username}:${var.database_password}@${module.rds.db_instance_address}:${module.rds.db_instance_port}/${var.database_name}"
  frontend_url = var.frontend_url != "" ? var.frontend_url : (var.domain_name != "" ? "https://${var.domain_name}" : "")
}

# Secrets Manager - Database URL for app runtimes
resource "aws_secretsmanager_secret" "database_url" {
  name        = "${var.project_name}/prod/database-url"
  description = "Database URL for prod runtimes"
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = local.database_url
}

# Secrets Manager - JWT secret for backend
resource "aws_secretsmanager_secret" "jwt" {
  name        = "${var.project_name}/prod/jwt-secret"
  description = "JWT secret for backend"
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = var.jwt_secret
}

# App Runner - Backend API (Express)
module "backend" {
  source = "../modules/apprunner"

  project_name                     = var.project_name
  environment                      = "prod"
  repository_url                   = var.backend_repository_url
  branch_name                      = var.backend_branch
  vpc_connector_subnet_ids          = module.vpc.private_subnet_ids
  vpc_connector_security_group_ids  = [aws_security_group.app.id]
  service_port                      = var.backend_port
  cpu                               = var.backend_cpu
  memory                            = var.backend_memory
  env_vars = {
    NODE_ENV     = "production"
    PORT         = tostring(var.backend_port)
    FRONTEND_URL = local.frontend_url
  }
  secrets = {
    DATABASE_URL = aws_secretsmanager_secret_version.database_url.arn
    JWT_SECRET   = aws_secretsmanager_secret_version.jwt.arn
  }
}

locals {
  backend_api_url = "${module.backend.service_url}/api"
}

# Amplify - Frontend (Next.js SSR)
module "frontend" {
  source = "../modules/amplify"

  project_name          = var.project_name
  environment           = "prod"
  repository_url        = var.frontend_repository_url
  branch_name           = var.frontend_branch
  github_access_token   = var.amplify_github_token
  app_root              = "frontend"
  environment_variables = {
    DATABASE_URL       = local.database_url
    NEXTAUTH_URL       = local.frontend_url
    NEXTAUTH_SECRET    = var.nextauth_secret
    NEXT_PUBLIC_API_URL = local.backend_api_url
  }
  domain_name      = var.domain_name
  route53_zone_id  = data.aws_route53_zone.main[0].zone_id
  subdomains       = ["", "www"]
  service_role_suffix = var.amplify_service_role_suffix
  use_service_linked_role = var.amplify_use_service_linked_role
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

