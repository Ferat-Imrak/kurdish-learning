variable "project_name" {
  description = "Project name (used for resource naming)"
  type        = string
}

variable "environment" {
  description = "Environment name (dev/prod)"
  type        = string
}

variable "repository_url" {
  description = "GitHub repository URL for the backend (App Runner)"
  type        = string
}

variable "branch_name" {
  description = "Branch name to deploy"
  type        = string
}

variable "source_directory" {
  description = "Source directory within the repo"
  type        = string
  default     = "backend"
}

variable "vpc_connector_subnet_ids" {
  description = "Private subnet IDs for VPC connector"
  type        = list(string)
}

variable "vpc_connector_security_group_ids" {
  description = "Security groups for VPC connector"
  type        = list(string)
}

variable "service_port" {
  description = "App port exposed by the service"
  type        = number
  default     = 8080
}

variable "cpu" {
  description = "CPU for App Runner instances (e.g. 1024, 2048)"
  type        = string
  default     = "1024"
}

variable "memory" {
  description = "Memory for App Runner instances (e.g. 2048, 3072)"
  type        = string
  default     = "2048"
}

variable "build_command" {
  description = "Build command for App Runner"
  type        = string
  default     = "npm ci && npx prisma generate && npm run build"
}

variable "start_command" {
  description = "Start command for App Runner"
  type        = string
  default     = "sh scripts/apprunner-start.sh"
}

variable "env_vars" {
  description = "Environment variables for the backend"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secrets for the backend (map of name -> Secrets Manager ARN)"
  type        = map(string)
  default     = {}
}
