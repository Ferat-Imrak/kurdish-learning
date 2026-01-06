# RDS PostgreSQL Module - Cost-optimized database
terraform {
  required_version = ">= 1.0"
}

# Get available PostgreSQL version (if not specified)
data "aws_rds_engine_version" "postgres" {
  count   = var.engine_version == "" ? 1 : 0
  engine  = "postgres"
  version = "15"
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from application"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_security_group_id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# RDS Parameter Group (for optimization)
resource "aws_db_parameter_group" "main" {
  name   = "${var.project_name}-${var.environment}-pg-params"
  family = var.db_parameter_family

  tags = {
    Name        = "${var.project_name}-${var.environment}-pg-params"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# RDS Instance - Cost-optimized (db.t3.micro)
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  engine         = "postgres"
  engine_version = var.engine_version != "" ? var.engine_version : data.aws_rds_engine_version.postgres[0].version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted      = true

  db_name  = var.database_name
  username = var.database_username
  password = var.database_password # Should use Secrets Manager in production

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  parameter_group_name   = aws_db_parameter_group.main.name

  backup_retention_period = var.backup_retention_period
  backup_window            = var.backup_window
  maintenance_window       = var.maintenance_window

  skip_final_snapshot       = var.environment == "dev" ? true : false
  final_snapshot_identifier = var.environment == "dev" ? null : "${var.project_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled     = var.environment == "prod" ? true : false

  tags = {
    Name        = "${var.project_name}-${var.environment}-db"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

