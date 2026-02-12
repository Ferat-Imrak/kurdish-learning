output "service_url" {
  description = "App Runner service URL"
  value       = aws_apprunner_service.this.service_url
}

output "service_arn" {
  description = "App Runner service ARN"
  value       = aws_apprunner_service.this.arn
}

output "connection_arn" {
  description = "App Runner connection ARN (requires GitHub authorization)"
  value       = aws_apprunner_connection.this.arn
}

output "vpc_connector_arn" {
  description = "App Runner VPC connector ARN"
  value       = aws_apprunner_vpc_connector.this.arn
}
