# PROVIDERS
provider "<%= cloud_provider %>" {
  region = "<%= region %>"
  version = "~> <%= cloud_provider_version %>"
}

# TERRAFORM CONFIG
terraform {
  required_version = "=0.12.30"
  # TODO: uncomment the following line after first pass to move state to the backend
  #backend "<%= tf_backend %>" {}
}

# RESOURCES
resource "aws_kms_key" "backend_kms_key" {
  description             = "This key is used to encrypt backend bucket objects"
  deletion_window_in_days = 10
  key_usage               = "ENCRYPT_DECRYPT"
  enable_key_rotation     = true
  tags = merge(var.common_tags, {
    Tier        = "Meta",
    Environment = var.environment
  })
}

resource "aws_s3_bucket" "backend_bucket" {
  #cjc:skip=CKV_AWS_52:Allow bucket without MFA delete enabled for now
  #cjc:skip=CKV_AWS_18:Allow bucket without access logging enabled for now
  bucket = var.bucket
  acl    = "private"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.backend_kms_key.arn
        sse_algorithm     = "aws:kms"
      }
    }
  }

  tags = merge(var.common_tags, {
    Tier        = "Meta",
    Environment = var.environment
  })
}

resource "aws_s3_bucket_public_access_block" "bucket_access" {
  bucket = aws_s3_bucket.backend_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
