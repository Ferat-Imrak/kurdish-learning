output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "database_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = module.rds.database_name
}

output "frontend_url" {
  description = "Frontend URL"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : module.frontend.cloudfront_url
}

output "frontend_s3_bucket" {
  description = "Frontend S3 bucket name"
  value       = module.frontend.s3_bucket_id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.frontend.cloudfront_distribution_id
}

output "terraform_state_bucket" {
  description = "Terraform state bucket"
  value       = module.terraform_state.state_bucket_id
}

