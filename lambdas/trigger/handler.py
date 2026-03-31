"""
trigger — daily orchestrator.
1. Reads videos from DB that have no transcript yet
2. Sends each to the transcribe SQS queue
3. Reads videos with transcript but no analysis
4. Sends each to the analyze SQS queue
"""
import json
import os
import logging
import psycopg2
import psycopg2.extras
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sqs = boto3.client("sqs")

DB_HOST              = os.environ["DB_HOST"]
DB_NAME              = os.environ["DB_NAME"]
DB_USER              = os.environ["DB_USER"]
DB_PASSWORD          = os.environ["DB_PASSWORD"]
TRANSCRIBE_QUEUE_URL = os.environ["TRANSCRIBE_QUEUE_URL"]
ANALYZE_QUEUE_URL    = os.environ["ANALYZE_QUEUE_URL"]
S3_BUCKET            = os.environ["S3_BUCKET"]


def get_db():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, connect_timeout=10
    )


def enqueue_transcriptions(conn):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """
            SELECT id, tiktok_video_id, video_url
            FROM videos
            WHERE transcript IS NULL AND video_url != ''
            ORDER BY gmv_usd DESC
            LIMIT 100
            """
        )
        rows = cur.fetchall()

    count = 0
    for row in rows:
        sqs.send_message(
            QueueUrl=TRANSCRIBE_QUEUE_URL,
            MessageBody=json.dumps({
                "video_id":        row["id"],
                "tiktok_video_id": row["tiktok_video_id"],
                "video_url":       row["video_url"],
                "s3_bucket":       S3_BUCKET,
            }),
        )
        count += 1

    logger.info(f"Queued {count} videos for transcription")
    return count


def enqueue_analyses(conn):
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """
            SELECT id, tiktok_video_id, transcript
            FROM videos
            WHERE transcript IS NOT NULL
              AND analysis_completed_at IS NULL
            ORDER BY gmv_usd DESC
            LIMIT 100
            """
        )
        rows = cur.fetchall()

    count = 0
    for row in rows:
        sqs.send_message(
            QueueUrl=ANALYZE_QUEUE_URL,
            MessageBody=json.dumps({
                "video_id":        row["id"],
                "tiktok_video_id": row["tiktok_video_id"],
                "transcript":      row["transcript"],
            }),
        )
        count += 1

    logger.info(f"Queued {count} videos for analysis")
    return count


def lambda_handler(event, context):
    conn = get_db()
    try:
        transcribe_count = enqueue_transcriptions(conn)
        analyze_count    = enqueue_analyses(conn)
    finally:
        conn.close()

    return {
        "statusCode": 200,
        "body": json.dumps({
            "queued_for_transcription": transcribe_count,
            "queued_for_analysis":      analyze_count,
        }),
    }
