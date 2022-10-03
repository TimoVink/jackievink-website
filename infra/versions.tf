terraform {
  cloud {
    organization = "timovink"

    workspaces {
      name = "jackievink-website"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.33"
    }
  }
}
