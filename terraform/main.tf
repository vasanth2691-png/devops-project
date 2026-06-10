provider "aws" {
  region = var.aws_region
}

# Example placeholder resource for learning.
# Replace with your actual infra (ECR, EKS, VPC, etc.).
resource "aws_s3_bucket" "devops_sample" {
  bucket = var.bucket_name

  tags = {
    Project = "devops-sample"
    Env     = var.environment
  }
}
