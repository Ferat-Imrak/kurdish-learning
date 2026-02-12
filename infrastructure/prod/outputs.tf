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
  value       = var.domain_name != "" ? "https://${var.domain_name}" : module.frontend.branch_url
}

output "frontend_default_domain" {
  description = "Amplify default domain"
  value       = module.frontend.default_domain
}

output "terraform_state_bucket" {
  description = "Terraform state bucket"
  value       = module.terraform_state.state_bucket_id
}

