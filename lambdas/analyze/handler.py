"""
analyze — sends transcript to an LLM and extracts structured insights.

LLM selection (via ALIBABA_API_KEY env var):
  - If ALIBABA_API_KEY is set → uses Alibaba Cloud Qwen (DashScope API)
  - Otherwise → uses Anthropic Claude (default)

Triggered by SQS queue after transcription is complete.
"""
import json
import os
import logging
import psycopg2
import anthropic
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ALIBABA_API_KEY   = os.environ.get("ALIBABA_API_KEY", "")

# Use Qwen if Alibaba key is configured, else Claude
USE_QWEN = bool(ALIBABA_API_KEY)

QWEN_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
QWEN_MODEL    = "qwen-plus"   # qwen-plus = Qwen3.5, cost-effective for structured output

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


def analyze_with_claude(transcript: str) -> dict:
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": ANALYSIS_PROMPT.format(transcript=transcript[:4000])}
        ],
    )
    return json.loads(message.content[0].text.strip())


def analyze_with_qwen(transcript: str) -> dict:
    """
    Calls Alibaba Cloud Qwen via DashScope OpenAI-compatible endpoint.
    Model: qwen-plus (Qwen3.5)
    Docs: https://www.alibabacloud.com/help/en/dashscope/
    """
    headers = {
        "Authorization": f"Bearer {ALIBABA_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": QWEN_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": ANALYSIS_PROMPT.format(transcript=transcript[:4000])},
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
    }
    resp = requests.post(
        f"{QWEN_BASE_URL}/chat/completions",
        headers=headers,
        json=payload,
        timeout=60,
    )
    resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"].strip()
    return json.loads(raw)


def analyze_transcript(transcript: str) -> dict:
    if USE_QWEN:
        logger.info("Using Qwen (Alibaba Cloud) for analysis")
        return analyze_with_qwen(transcript)
    logger.info("Using Claude (Anthropic) for analysis")
    return analyze_with_claude(transcript)


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
                                hook                  = %(hook)s,
                                pain_point            = %(pain_point)s,
                                solution              = %(solution)s,
                                cta                   = %(cta)s,
                                tone                  = %(tone)s,
                                viral_triggers        = %(viral_triggers)s,
                                product_positioning   = %(product_positioning)s,
                                target_audience       = %(estimated_target_audience)s,
                                hook_score            = %(hook_score)s,
                                overall_score         = %(overall_score)s,
                                analysis_completed_at = NOW()
                            WHERE id = %(video_id)s
                            """,
                            {
                                **analysis,
                                "video_id":       video_id,
                                "viral_triggers": json.dumps(analysis.get("viral_triggers", [])),
                            },
                        )
            finally:
                conn.close()

            logger.info(f"Analysis saved for {tiktok_video_id}")

        except json.JSONDecodeError as e:
            logger.error(f"LLM returned invalid JSON for {tiktok_video_id}: {e}")
            raise
        except Exception as e:
            logger.error(f"Analysis failed for {tiktok_video_id}: {e}")
            raise

    return {"statusCode": 200}
