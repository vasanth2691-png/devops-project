output "bucket_name" {
  value       = aws_s3_bucket.devops_sample.bucket
  description = "Created bucket name"
}
