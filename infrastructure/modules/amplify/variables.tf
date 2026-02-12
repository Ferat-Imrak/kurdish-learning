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

variable "build_spec_override" {
  description = "Optional build spec override; leave empty to use Amplify defaults"
  type        = string
  default     = ""
}

variable "app_name_suffix" {
  description = "Optional suffix to force a new Amplify app"
  type        = string
  default     = ""
}

variable "service_role_arn_override" {
  description = "Optional pre-existing IAM role ARN for Amplify to assume"
  type        = string
  default     = ""
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

variable "service_role_suffix" {
  description = "Optional suffix to force a new Amplify service role"
  type        = string
  default     = ""
}

variable "use_service_linked_role" {
  description = "Use AWS service-linked role for Amplify instead of custom role"
  type        = bool
  default     = false
}

variable "manage_service_role" {
  description = "Create and manage the Amplify service role in Terraform"
  type        = bool
  default     = true
}
