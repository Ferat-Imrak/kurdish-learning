variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for RDS"
  type        = list(string)
}

variable "app_security_group_id" {
  description = "Security group ID of the application"
  type        = string
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
  description = "Database master password (should use Secrets Manager)"
  type        = string
  sensitive   = true
}

variable "instance_class" {
  description = "RDS instance class (db.t3.micro for cost optimization)"
  type        = string
  default     = "db.t3.micro"
}

variable "engine_version" {
  description = "PostgreSQL engine version (leave empty for latest)"
  type        = string
  default     = "15.10" # Available version in RDS
}

variable "db_parameter_family" {
  description = "DB parameter group family"
  type        = string
  default     = "postgres15"
}

variable "allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum allocated storage in GB (auto-scaling)"
  type        = number
  default     = 100
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

