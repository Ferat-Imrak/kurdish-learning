variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
}

variable "aws_account_id" {
  description = "AWS Account ID (for unique bucket naming)"
  type        = string
}

