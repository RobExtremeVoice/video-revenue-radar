data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "vrr-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "lambda_inline" {
  name = "vrr-lambda-inline"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = [aws_sqs_queue.transcribe.arn, aws_sqs_queue.analyze.arn]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject"]
        Resource = "${aws_s3_bucket.assets.arn}/transcripts/*"
      }
    ]
  })
}

# Lambda Layer (Python deps)
resource "aws_lambda_layer_version" "deps" {
  filename            = "../../lambdas/layer/lambda_layer.zip"
  layer_name          = "vrr-python-deps"
  compatible_runtimes = ["python3.11"]
  source_code_hash    = filebase64sha256("../../lambdas/layer/lambda_layer.zip")
  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

locals {
  common_env = {
    DB_HOST              = aws_db_instance.postgres.address
    DB_NAME              = "fashion_intelligence"
    DB_USER              = "admin"
    DB_PASSWORD          = var.db_password
    S3_BUCKET            = aws_s3_bucket.assets.id
    TRANSCRIBE_QUEUE_URL = aws_sqs_queue.transcribe.url
    ANALYZE_QUEUE_URL    = aws_sqs_queue.analyze.url
    APIFY_TOKEN          = var.apify_token
    OPENAI_API_KEY       = var.openai_api_key
    ANTHROPIC_API_KEY    = var.anthropic_api_key
  }
  vpc_config = {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# fetch_videos Lambda
data "archive_file" "fetch_videos" {
  type        = "zip"
  source_dir  = "../../lambdas/fetch_videos"
  output_path = "../../lambdas/dist/fetch_videos.zip"
}

resource "aws_lambda_function" "fetch_videos" {
  filename         = data.archive_file.fetch_videos.output_path
  function_name    = "vrr-fetch-videos"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 300
  memory_size      = 512
  source_code_hash = data.archive_file.fetch_videos.output_base64sha256
  layers           = [aws_lambda_layer_version.deps.arn]
  environment { variables = local.common_env }
  vpc_config {
    subnet_ids         = local.vpc_config.subnet_ids
    security_group_ids = local.vpc_config.security_group_ids
  }
}

# transcribe Lambda
data "archive_file" "transcribe" {
  type        = "zip"
  source_dir  = "../../lambdas/transcribe"
  output_path = "../../lambdas/dist/transcribe.zip"
}

resource "aws_lambda_function" "transcribe" {
  filename         = data.archive_file.transcribe.output_path
  function_name    = "vrr-transcribe"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 600
  memory_size      = 1024
  source_code_hash = data.archive_file.transcribe.output_base64sha256
  layers           = [aws_lambda_layer_version.deps.arn]
  environment { variables = local.common_env }
  vpc_config {
    subnet_ids         = local.vpc_config.subnet_ids
    security_group_ids = local.vpc_config.security_group_ids
  }
}

resource "aws_lambda_event_source_mapping" "transcribe_sqs" {
  event_source_arn = aws_sqs_queue.transcribe.arn
  function_name    = aws_lambda_function.transcribe.arn
  batch_size       = 1
}

# analyze Lambda
data "archive_file" "analyze" {
  type        = "zip"
  source_dir  = "../../lambdas/analyze"
  output_path = "../../lambdas/dist/analyze.zip"
}

resource "aws_lambda_function" "analyze" {
  filename         = data.archive_file.analyze.output_path
  function_name    = "vrr-analyze"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 120
  memory_size      = 512
  source_code_hash = data.archive_file.analyze.output_base64sha256
  layers           = [aws_lambda_layer_version.deps.arn]
  environment { variables = local.common_env }
  vpc_config {
    subnet_ids         = local.vpc_config.subnet_ids
    security_group_ids = local.vpc_config.security_group_ids
  }
}

resource "aws_lambda_event_source_mapping" "analyze_sqs" {
  event_source_arn = aws_sqs_queue.analyze.arn
  function_name    = aws_lambda_function.analyze.arn
  batch_size       = 5
}

# query Lambda (API)
data "archive_file" "query" {
  type        = "zip"
  source_dir  = "../../lambdas/query"
  output_path = "../../lambdas/dist/query.zip"
}

resource "aws_lambda_function" "query" {
  filename         = data.archive_file.query.output_path
  function_name    = "vrr-query"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 30
  memory_size      = 256
  source_code_hash = data.archive_file.query.output_base64sha256
  layers           = [aws_lambda_layer_version.deps.arn]
  environment { variables = local.common_env }
  vpc_config {
    subnet_ids         = local.vpc_config.subnet_ids
    security_group_ids = local.vpc_config.security_group_ids
  }
}

# trigger Lambda (orchestrator)
data "archive_file" "trigger" {
  type        = "zip"
  source_dir  = "../../lambdas/trigger"
  output_path = "../../lambdas/dist/trigger.zip"
}

resource "aws_lambda_function" "trigger" {
  filename         = data.archive_file.trigger.output_path
  function_name    = "vrr-trigger"
  role             = aws_iam_role.lambda.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 60
  memory_size      = 256
  source_code_hash = data.archive_file.trigger.output_base64sha256
  layers           = [aws_lambda_layer_version.deps.arn]
  environment { variables = local.common_env }
  vpc_config {
    subnet_ids         = local.vpc_config.subnet_ids
    security_group_ids = local.vpc_config.security_group_ids
  }
}
