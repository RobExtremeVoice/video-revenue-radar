resource "aws_sqs_queue" "transcribe_dlq" {
  name                      = "vrr-transcribe-dlq"
  message_retention_seconds = 1209600 # 14 days
}

resource "aws_sqs_queue" "transcribe" {
  name                       = "vrr-transcribe"
  visibility_timeout_seconds = 660  # must be >= Lambda timeout
  message_retention_seconds  = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.transcribe_dlq.arn
    maxReceiveCount     = 2
  })
}

resource "aws_sqs_queue" "analyze_dlq" {
  name                      = "vrr-analyze-dlq"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "analyze" {
  name                       = "vrr-analyze"
  visibility_timeout_seconds = 180
  message_retention_seconds  = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.analyze_dlq.arn
    maxReceiveCount     = 3
  })
}
