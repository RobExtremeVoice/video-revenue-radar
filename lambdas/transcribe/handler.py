"""
transcribe — downloads TikTok video audio and transcribes with Whisper.
Triggered by SQS queue (one message per video_id).
"""
import json
import os
import logging
import tempfile
import psycopg2
import requests
import boto3
from openai import OpenAI

logger = logging.getLogger()
logger.setLevel(logging.INFO)

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
s3             = boto3.client("s3")

DB_HOST     = os.environ["DB_HOST"]
DB_NAME     = os.environ["DB_NAME"]
DB_USER     = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
S3_BUCKET   = os.environ["S3_BUCKET"]


def get_db():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, connect_timeout=10
    )


def download_audio(video_url: str, dest_path: str):
    """Stream video to a temp file — Whisper accepts mp4 directly."""
    with requests.get(video_url, stream=True, timeout=60) as r:
        r.raise_for_status()
        with open(dest_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)


def transcribe_audio(file_path: str) -> str:
    with open(file_path, "rb") as f:
        result = openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            language="en",
            response_format="text",
        )
    return result


def process_video(video_id: int, video_url: str, tiktok_video_id: str):
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        logger.info(f"Downloading video {tiktok_video_id}")
        download_audio(video_url, tmp_path)

        logger.info(f"Transcribing {tiktok_video_id}")
        transcript = transcribe_audio(tmp_path)

        # Store raw transcript in S3
        s3_key = f"transcripts/{tiktok_video_id}.txt"
        s3.put_object(Bucket=S3_BUCKET, Key=s3_key, Body=transcript.encode("utf-8"))

        # Update DB
        conn = get_db()
        try:
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE videos SET transcript = %s, transcript_s3_key = %s WHERE id = %s",
                        (transcript[:5000], s3_key, video_id),  # truncate for DB, full in S3
                    )
        finally:
            conn.close()

        logger.info(f"Transcribed {tiktok_video_id}: {len(transcript)} chars")
        return transcript

    finally:
        os.unlink(tmp_path)


def lambda_handler(event, context):
    for record in event.get("Records", []):
        body = json.loads(record["body"])
        video_id       = body["video_id"]
        video_url      = body["video_url"]
        tiktok_video_id = body["tiktok_video_id"]

        try:
            process_video(video_id, video_url, tiktok_video_id)
        except Exception as e:
            logger.error(f"Failed to transcribe {tiktok_video_id}: {e}")
            raise  # re-raise so SQS retries

    return {"statusCode": 200}
