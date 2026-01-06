output "state_bucket_id" {
  description = "Terraform state S3 bucket ID"
  value       = aws_s3_bucket.terraform_state.id
}

output "state_bucket_arn" {
  description = "Terraform state S3 bucket ARN"
  value       = aws_s3_bucket.terraform_state.arn
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for state locking"
  value       = aws_dynamodb_table.terraform_state_lock.name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN for state locking"
  value       = aws_dynamodb_table.terraform_state_lock.arn
}

