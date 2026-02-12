terraform {
  required_version = ">= 1.0"
}

resource "aws_apprunner_connection" "this" {
  connection_name = "${var.project_name}-${var.environment}-github"
  provider_type   = "GITHUB"
}

resource "aws_apprunner_vpc_connector" "this" {
  vpc_connector_name = "${var.project_name}-${var.environment}-backend-vpc"
  subnets            = var.vpc_connector_subnet_ids
  security_groups    = var.vpc_connector_security_group_ids
}

resource "aws_iam_role" "instance" {
  name               = "${var.project_name}-${var.environment}-apprunner-instance"
  assume_role_policy = data.aws_iam_policy_document.instance_assume.json
}

data "aws_iam_policy_document" "instance_assume" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["tasks.apprunner.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "secrets_access" {
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = length(var.secrets) > 0 ? values(var.secrets) : ["*"]
  }
}

resource "aws_iam_role_policy" "secrets_access" {
  name   = "${var.project_name}-${var.environment}-apprunner-secrets"
  role   = aws_iam_role.instance.id
  policy = data.aws_iam_policy_document.secrets_access.json
}

resource "aws_apprunner_service" "this" {
  service_name = "${var.project_name}-${var.environment}-backend"

  source_configuration {
    auto_deployments_enabled = true

    authentication_configuration {
      connection_arn = aws_apprunner_connection.this.arn
    }

    code_repository {
      repository_url = var.repository_url
      source_directory = var.source_directory

      source_code_version {
        type  = "BRANCH"
        value = var.branch_name
      }

      code_configuration {
        configuration_source = "API"

        code_configuration_values {
          runtime = "NODEJS_22"
          build_command = var.build_command
          start_command = var.start_command
          port          = tostring(var.service_port)
          runtime_environment_variables = var.env_vars
          runtime_environment_secrets   = var.secrets
        }
      }
    }
  }

  instance_configuration {
    cpu               = var.cpu
    memory            = var.memory
    instance_role_arn = aws_iam_role.instance.arn
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.this.arn
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}
