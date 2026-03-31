"""
fetch_videos — pulls top TikTok Shop fashion videos from Fastmoss API
and upserts into PostgreSQL.
Triggered daily by EventBridge.
"""
import json
import os
import logging
import psycopg2
import requests
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

FASTMOSS_API_KEY = os.environ["FASTMOSS_API_KEY"]
FASTMOSS_BASE    = "https://api.fastmoss.com/v1"
DB_HOST          = os.environ["DB_HOST"]
DB_NAME          = os.environ["DB_NAME"]
DB_USER          = os.environ["DB_USER"]
DB_PASSWORD      = os.environ["DB_PASSWORD"]

FASHION_CATEGORY_ID = "200001"   # TikTok Shop: Women's Clothing & Accessories
TARGET_REGION       = "US"
FETCH_LIMIT         = 200        # top videos per run


def get_db():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, connect_timeout=10
    )


def fetch_top_videos():
    """Fetch top GMV videos from Fastmoss filtered by fashion category."""
    headers = {"Authorization": f"Bearer {FASTMOSS_API_KEY}", "Content-Type": "application/json"}
    params = {
        "region":      TARGET_REGION,
        "category_id": FASHION_CATEGORY_ID,
        "sort_by":     "gmv",
        "order":       "desc",
        "limit":       FETCH_LIMIT,
        "period":      "7d",
    }
    resp = requests.get(f"{FASTMOSS_BASE}/videos/top", headers=headers, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json().get("data", [])


def upsert_video(cur, v):
    cur.execute(
        """
        INSERT INTO videos (
            tiktok_video_id, title, author_username, author_id,
            views, likes, shares, comments,
            gmv_usd, gmv_estimated, units_sold,
            product_name, product_id, product_price,
            category, region, video_url, thumbnail_url,
            duration_seconds, fetched_at
        ) VALUES (
            %(tiktok_video_id)s, %(title)s, %(author_username)s, %(author_id)s,
            %(views)s, %(likes)s, %(shares)s, %(comments)s,
            %(gmv_usd)s, %(gmv_estimated)s, %(units_sold)s,
            %(product_name)s, %(product_id)s, %(product_price)s,
            %(category)s, %(region)s, %(video_url)s, %(thumbnail_url)s,
            %(duration_seconds)s, %(fetched_at)s
        )
        ON CONFLICT (tiktok_video_id) DO UPDATE SET
            views            = EXCLUDED.views,
            likes            = EXCLUDED.likes,
            shares           = EXCLUDED.shares,
            comments         = EXCLUDED.comments,
            gmv_usd          = EXCLUDED.gmv_usd,
            gmv_estimated    = EXCLUDED.gmv_estimated,
            units_sold       = EXCLUDED.units_sold,
            fetched_at       = EXCLUDED.fetched_at
        """,
        {
            "tiktok_video_id":  v.get("video_id"),
            "title":            v.get("title", ""),
            "author_username":  v.get("author", {}).get("username", ""),
            "author_id":        v.get("author", {}).get("id", ""),
            "views":            v.get("stats", {}).get("views", 0),
            "likes":            v.get("stats", {}).get("likes", 0),
            "shares":           v.get("stats", {}).get("shares", 0),
            "comments":         v.get("stats", {}).get("comments", 0),
            "gmv_usd":          v.get("gmv", {}).get("value", 0),
            "gmv_estimated":    v.get("gmv", {}).get("estimated", True),
            "units_sold":       v.get("units_sold", 0),
            "product_name":     v.get("product", {}).get("name", ""),
            "product_id":       v.get("product", {}).get("id", ""),
            "product_price":    v.get("product", {}).get("price", 0),
            "category":         v.get("category", "Fashion"),
            "region":           TARGET_REGION,
            "video_url":        v.get("video_url", ""),
            "thumbnail_url":    v.get("thumbnail", ""),
            "duration_seconds": v.get("duration", 0),
            "fetched_at":       datetime.now(timezone.utc),
        },
    )


def lambda_handler(event, context):
    logger.info("fetch_videos started")
    videos = fetch_top_videos()
    logger.info(f"Fetched {len(videos)} videos from Fastmoss")

    conn = get_db()
    try:
        with conn:
            with conn.cursor() as cur:
                for v in videos:
                    upsert_video(cur, v)
        logger.info(f"Upserted {len(videos)} videos")
    finally:
        conn.close()

    return {"statusCode": 200, "body": json.dumps({"upserted": len(videos)})}
