provider "aws" {
  region = "us-west-2"

  default_tags {
    tags = {
      Project = "jackievink-website"
    }
  }
}

provider "aws" {
  alias  = "global"
  region = "us-east-1"

  default_tags {
    tags = {
      Project = "jackievink-website"
    }
  }
}


#
# Configuration
#

locals {
  website_url = "jackievink.com"
  ttl         = 300
}


#
# External
#

data "aws_vpc" "this" {
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.this.id]
  }
}

data "aws_route53_zone" "this" {
  name = local.website_url
}

data "aws_acm_certificate" "this" {
  provider = aws.global

  domain   = local.website_url
  statuses = ["ISSUED"]
}


#
# Resources
#

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = "www"
  type    = "CNAME"
  ttl     = local.ttl
  records = ["cname.vercel-dns.com."]
}

resource "aws_route53_record" "s" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = local.website_url
  type    = "A"
  ttl     = local.ttl
  records = ["76.76.21.21"]
}

resource "aws_security_group" "db_access" {
  name   = "jackievink-website-db-access"
  vpc_id = data.aws_vpc.this.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "this" {
  name       = "jackievink-website"
  subnet_ids = data.aws_subnets.public.ids
}

resource "aws_rds_cluster" "this" {
  cluster_identifier = "jackievink-website"

  engine         = "aurora-postgresql"
  engine_mode    = "provisioned"
  engine_version = "15.7"

  database_name   = "jackievink"
  master_username = var.db_username
  master_password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.db_access.id]

  storage_encrypted   = true
  skip_final_snapshot = true

  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 8.0
  }
}

resource "aws_rds_cluster_instance" "this" {
  cluster_identifier = aws_rds_cluster.this.id
  identifier         = "jackievink-website-1"

  engine         = aws_rds_cluster.this.engine
  engine_version = aws_rds_cluster.this.engine_version
  instance_class = "db.serverless"

  db_subnet_group_name = aws_db_subnet_group.this.name
  publicly_accessible  = true
}

resource "aws_s3_bucket" "this" {
  bucket = "jackievink-website"
}

resource "aws_cloudfront_origin_access_identity" "this" {}

data "aws_iam_policy_document" "oai_access" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.this.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.this.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id
  policy = data.aws_iam_policy_document.oai_access.json
}

resource "aws_cloudfront_cache_policy" "this" {
  name = "jackievink-website"

  min_ttl     = 31536000
  default_ttl = 31536000
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "this" {
  aliases = ["static.jackievink.com"]

  enabled         = true
  is_ipv6_enabled = true

  price_class = "PriceClass_100"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "s3"

    viewer_protocol_policy = "redirect-to-https"

    # CORS-With-Preflight
    response_headers_policy_id = "5cc3b908-e619-4b99-88e5-2cf7f45965bd"
    cache_policy_id            = aws_cloudfront_cache_policy.this.id
  }

  origin {
    domain_name = aws_s3_bucket.this.bucket_regional_domain_name
    origin_id   = "s3"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.this.cloudfront_access_identity_path
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.this.arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_route53_record" "website_dns" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = "static"
  type    = "CNAME"
  ttl     = 300

  records = [aws_cloudfront_distribution.this.domain_name]
}
