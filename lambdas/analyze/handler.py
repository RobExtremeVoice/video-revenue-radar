"""
analyze — sends transcript to Claude and extracts structured insights.
Triggered by SQS queue after transcription is complete.
"""
import json
import os
import logging
import psycopg2
import anthropic

logger = logging.getLogger()
logger.setLevel(logging.INFO)

claude_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

DB_HOST     = os.environ["DB_HOST"]
DB_NAME     = os.environ["DB_NAME"]
DB_USER     = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]

SYSTEM_PROMPT = """You are an expert TikTok Shop video analyst specializing in fashion content.
Given a video transcript, extract the key persuasion and sales elements.
Respond ONLY with valid JSON — no markdown, no explanation."""

ANALYSIS_PROMPT = """Analyze this TikTok Shop fashion video transcript and return a JSON object with exactly these fields:

{
  "hook": "The opening 3-5 seconds hook — what immediately grabs attention",
  "pain_point": "The viewer problem or desire the video addresses",
  "solution": "How the product solves the pain point",
  "cta": "The call-to-action used (e.g. 'link in bio', 'shop now', 'comment SIZE')",
  "tone": "One of: educational | entertaining | urgent | aspirational | social_proof",
  "viral_triggers": ["list", "of", "viral", "elements", "used"],
  "product_positioning": "How the product is positioned (e.g. 'luxury for less', 'trending style')",
  "estimated_target_audience": "Who this video targets",
  "hook_score": 8,
  "overall_score": 7
}

hook_score and overall_score are integers 1-10.

Transcript:
{transcript}"""


def analyze_transcript(transcript: str) -> dict:
    message = claude_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": ANALYSIS_PROMPT.format(transcript=transcript[:4000])}
        ],
    )
    raw = message.content[0].text.strip()
    return json.loads(raw)


def get_db():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, connect_timeout=10
    )


def lambda_handler(event, context):
    for record in event.get("Records", []):
        body = json.loads(record["body"])
        video_id        = body["video_id"]
        tiktok_video_id = body["tiktok_video_id"]
        transcript      = body["transcript"]

        try:
            logger.info(f"Analyzing {tiktok_video_id}")
            analysis = analyze_transcript(transcript)

            conn = get_db()
            try:
                with conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            UPDATE videos SET
                                hook                     = %(hook)s,
                                pain_point               = %(pain_point)s,
                                solution                 = %(solution)s,
                                cta                      = %(cta)s,
                                tone                     = %(tone)s,
                                viral_triggers           = %(viral_triggers)s,
                                product_positioning      = %(product_positioning)s,
                                target_audience          = %(estimated_target_audience)s,
                                hook_score               = %(hook_score)s,
                                overall_score            = %(overall_score)s,
                                analysis_completed_at    = NOW()
                            WHERE id = %(video_id)s
                            """,
                            {**analysis, "video_id": video_id, "viral_triggers": json.dumps(analysis.get("viral_triggers", []))},
                        )
            finally:
                conn.close()

            logger.info(f"Analysis saved for {tiktok_video_id}")

        except json.JSONDecodeError as e:
            logger.error(f"Claude returned invalid JSON for {tiktok_video_id}: {e}")
            raise
        except Exception as e:
            logger.error(f"Analysis failed for {tiktok_video_id}: {e}")
            raise

    return {"statusCode": 200}
