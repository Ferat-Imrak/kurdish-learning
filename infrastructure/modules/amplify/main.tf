terraform {
  required_version = ">= 1.0"
}

data "aws_iam_policy_document" "amplify_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "amplify_service" {
  count              = var.manage_service_role && !var.use_service_linked_role ? 1 : 0
  name               = "${var.project_name}-${var.environment}-amplify-service-role${var.service_role_suffix}"
  assume_role_policy = data.aws_iam_policy_document.amplify_assume_role.json
}

resource "aws_iam_role_policy_attachment" "amplify_service" {
  count      = var.manage_service_role && !var.use_service_linked_role ? 1 : 0
  role       = aws_iam_role.amplify_service[0].name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

resource "aws_iam_service_linked_role" "amplify" {
  count       = var.manage_service_role && var.use_service_linked_role ? 1 : 0
  aws_service_name = "amplify.amazonaws.com"
}

data "aws_iam_role" "amplify_slr" {
  count = var.manage_service_role && var.use_service_linked_role ? 1 : 0
  name  = "AWSServiceRoleForAmplify"
  depends_on = [aws_iam_service_linked_role.amplify]
}

resource "aws_amplify_app" "this" {
  name                 = "${var.project_name}-${var.environment}-frontend${var.app_name_suffix}"
  repository           = var.repository_url
  access_token         = var.github_access_token
  platform             = "WEB_COMPUTE"
  enable_branch_auto_build = true
  iam_service_role_arn = var.service_role_arn_override != "" ? var.service_role_arn_override : (
    var.manage_service_role ? (
      var.use_service_linked_role ? data.aws_iam_role.amplify_slr[0].arn : aws_iam_role.amplify_service[0].arn
    ) : null
  )

  environment_variables = var.environment_variables

  build_spec = <<EOF
version: 1
applications:
  - appRoot: ${var.app_root}
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
        postBuild:
          commands:
            - npx amplify-hosting configure
      artifacts:
        baseDirectory: .amplify-hosting
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
EOF

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

resource "aws_amplify_branch" "this" {
  app_id      = aws_amplify_app.this.id
  branch_name = var.branch_name
  stage       = var.environment == "prod" ? "PRODUCTION" : "DEVELOPMENT"
  enable_auto_build = true
}

locals {
  domain_enabled = var.domain_name != "" && var.route53_zone_id != ""
}

resource "aws_amplify_domain_association" "this" {
  count       = local.domain_enabled ? 1 : 0
  app_id      = aws_amplify_app.this.id
  domain_name = var.domain_name

  dynamic "sub_domain" {
    for_each = local.domain_enabled ? var.subdomains : []
    content {
      branch_name = aws_amplify_branch.this.branch_name
      prefix      = sub_domain.value
    }
  }
}

locals {
  dns_records = local.domain_enabled ? {
    for d in aws_amplify_domain_association.this[0].sub_domain :
    (d.prefix != "" ? d.prefix : "root") => {
      name  = trim(split(" ", d.dns_record)[0], " ")
      type  = trim(split(" ", d.dns_record)[1], " ")
      value = trim(split(" ", d.dns_record)[2], " ")
    }
  } : {}
}

resource "aws_route53_record" "amplify" {
  for_each = local.dns_records

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.value]
}
