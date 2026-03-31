output "api_gateway_url" {
  value       = "https://${aws_api_gateway_rest_api.main.id}.execute-api.${var.aws_region}.amazonaws.com/prod"
  description = "API Gateway base URL — paste as VITE_API_BASE_URL in Lovable"
}

output "api_key_id" {
  value       = aws_api_gateway_api_key.dashboard.id
  description = "API Key ID — use with get_api_key.sh to get the actual key value"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.address
  description = "RDS PostgreSQL host"
  sensitive   = true
}

output "s3_frontend_bucket" {
  value       = aws_s3_bucket.frontend.id
  description = "S3 bucket for frontend build"
}

output "cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "CloudFront URL for the dashboard"
}

output "s3_assets_bucket" {
  value       = aws_s3_bucket.assets.id
  description = "S3 bucket for transcripts and assets"
}
