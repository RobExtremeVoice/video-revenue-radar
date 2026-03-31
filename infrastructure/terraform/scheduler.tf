resource "aws_iam_role" "eventbridge" {
  name = "vrr-eventbridge-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_invoke" {
  name = "vrr-eventbridge-invoke"
  role = aws_iam_role.eventbridge.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = [
        aws_lambda_function.fetch_videos.arn,
        aws_lambda_function.trigger.arn,
      ]
    }]
  })
}

# Daily fetch: 6 AM UTC
resource "aws_cloudwatch_event_rule" "daily_fetch" {
  name                = "vrr-daily-fetch"
  description         = "Fetch top TikTok Shop fashion videos daily"
  schedule_expression = "cron(0 6 * * ? *)"
}

resource "aws_cloudwatch_event_target" "fetch_videos" {
  rule      = aws_cloudwatch_event_rule.daily_fetch.name
  target_id = "fetch-videos"
  arn       = aws_lambda_function.fetch_videos.arn
}

resource "aws_lambda_permission" "allow_eventbridge_fetch" {
  statement_id  = "AllowEventBridgeFetch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fetch_videos.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_fetch.arn
}

# Daily trigger: 7 AM UTC (1h after fetch completes)
resource "aws_cloudwatch_event_rule" "daily_trigger" {
  name                = "vrr-daily-trigger"
  description         = "Trigger transcription and analysis pipeline"
  schedule_expression = "cron(0 7 * * ? *)"
}

resource "aws_cloudwatch_event_target" "trigger" {
  rule      = aws_cloudwatch_event_rule.daily_trigger.name
  target_id = "trigger"
  arn       = aws_lambda_function.trigger.arn
}

resource "aws_lambda_permission" "allow_eventbridge_trigger" {
  statement_id  = "AllowEventBridgeTrigger"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.trigger.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_trigger.arn
}
