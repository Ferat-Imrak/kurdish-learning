variable "project_name" {
  description = "Project name (used for resource naming)"
  type        = string
}

variable "environment" {
  description = "Environment name (dev/prod)"
  type        = string
}

variable "repository_url" {
  description = "GitHub repository URL for the frontend (Amplify)"
  type        = string
}

variable "branch_name" {
  description = "Branch name to deploy"
  type        = string
}

variable "github_access_token" {
  description = "GitHub personal access token for Amplify (repo access)"
  type        = string
  sensitive   = true
}

variable "app_root" {
  description = "App root path for monorepo"
  type        = string
  default     = "frontend"
}

variable "environment_variables" {
  description = "Environment variables for the Amplify app"
  type        = map(string)
  default     = {}
}

variable "domain_name" {
  description = "Domain name to attach (optional)"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID (required if domain_name set)"
  type        = string
  default     = ""
}

variable "subdomains" {
  description = "List of subdomain prefixes to map (\"\" for apex)"
  type        = list(string)
  default     = ["", "www"]
}
