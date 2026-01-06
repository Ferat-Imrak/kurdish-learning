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

variable "domain_name" {
  description = "Domain name for CloudFront (optional)"
  type        = string
  default     = ""
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN (optional, for custom domain)"
  type        = string
  default     = ""
}

variable "price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_100" # Cheapest - only US, Canada, Europe
}

