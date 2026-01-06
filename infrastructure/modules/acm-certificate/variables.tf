variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
}

variable "domain_name" {
  description = "Domain name for certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "Subject alternative names for certificate"
  type        = list(string)
  default     = []
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for DNS validation"
  type        = string
}

