variable "project_name" {
  description = "Project name (used for resource naming)"
  type        = string
  default     = "peyvi"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "kurdish_learning"
}

variable "database_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
}

variable "database_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name (optional for dev)"
  type        = string
  default     = ""
}

variable "frontend_repository_url" {
  description = "GitHub repository URL for the frontend"
  type        = string
}

variable "frontend_branch" {
  description = "Frontend branch to deploy"
  type        = string
  default     = "main"
}

variable "amplify_github_token" {
  description = "GitHub access token for Amplify"
  type        = string
  sensitive   = true
}

variable "backend_repository_url" {
  description = "GitHub repository URL for the backend"
  type        = string
}

variable "backend_branch" {
  description = "Backend branch to deploy"
  type        = string
  default     = "main"
}

variable "jwt_secret" {
  description = "JWT secret for backend"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth secret for frontend"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL (optional for dev)"
  type        = string
  default     = ""
}

variable "backend_port" {
  description = "Backend port"
  type        = number
  default     = 8080
}

variable "backend_cpu" {
  description = "App Runner CPU"
  type        = string
  default     = "1024"
}

variable "backend_memory" {
  description = "App Runner memory"
  type        = string
  default     = "2048"
}

