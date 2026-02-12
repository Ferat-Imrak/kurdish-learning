output "app_id" {
  description = "Amplify app ID"
  value       = aws_amplify_app.this.id
}

output "default_domain" {
  description = "Amplify default domain"
  value       = aws_amplify_app.this.default_domain
}

output "branch_url" {
  description = "Amplify branch URL"
  value       = "https://${aws_amplify_branch.this.branch_name}.${aws_amplify_app.this.default_domain}"
}
