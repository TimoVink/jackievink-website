provider "aws" {
  region = "us-west-2"

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

data "aws_route53_zone" "this" {
  name = local.website_url
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
