"""
fetch_videos — pulls top TikTok Shop fashion videos via Apify
(webdatalabs/tiktok-shop-scraper) and upserts into PostgreSQL.

GMV is estimated because TikTok does not expose real sales data publicly:
  gmv_estimate = views × CONVERSION_RATE × product_price
  (TikTok Shop average conversion: ~0.3%)

Triggered daily by EventBridge.
"""
import json
import os
import time
import logging
import psycopg2
import requests
from datetime import datetime, timezone

logger = logging.getLogger()
logger.setLevel(logging.INFO)

APIFY_TOKEN  = os.environ["APIFY_TOKEN"]
APIFY_ACTOR  = "webdatalabs/tiktok-shop-scraper"
APIFY_BASE   = "https://api.apify.com/v2"

DB_HOST     = os.environ["DB_HOST"]
DB_NAME     = os.environ["DB_NAME"]
DB_USER     = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]

TARGET_REGION    = "US"
FETCH_LIMIT      = 200
CONVERSION_RATE  = 0.003   # 0.3% — TikTok Shop US average


def get_db():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, connect_timeout=10
    )


def estimate_gmv(views: int, product_price: float) -> float:
    """
    Estimate GMV from public engagement data.
    Formula: views × conversion_rate × product_price
    This mirrors how Fastmoss/Kalodata compute their 'estimated GMV'.
    """
    return round(views * CONVERSION_RATE * product_price, 2)


def run_apify_actor() -> list:
    """
    Start the Apify actor, wait for it to finish, return results.
    Uses synchronous run endpoint (waits up to 5 min).
    """
    url = f"{APIFY_BASE}/acts/{APIFY_ACTOR}/run-sync-get-dataset-items"
    params = {"token": APIFY_TOKEN}
    payload = {
        "searchQuery":   "fashion",        # keyword filter
        "country":       TARGET_REGION,    # US
        "maxItems":      FETCH_LIMIT,
        "sortBy":        "sales",          # best available sort proxy
        "categoryId":    "601110",         # Women's Fashion category
        "proxyConfig":   {"useApifyProxy": True},
    }

    logger.info(f"Starting Apify actor {APIFY_ACTOR}...")
    resp = requests.post(url, params=params, json=payload, timeout=300)
    resp.raise_for_status()
    items = resp.json()
    logger.info(f"Apify returned {len(items)} items")
    return items


def normalize(item: dict) -> dict:
    """
    Map Apify output fields → our internal schema.
    Apify field names may vary; .get() with fallbacks handles it safely.
    """
    views         = int(item.get("playCount") or item.get("views") or 0)
    product_price = float(item.get("productPrice") or item.get("price") or 0)
    units_sold    = int(item.get("sold") or item.get("unitsSold") or 0)

    # Use real units_sold if scraper provides it, else derive from views
    if units_sold > 0:
        gmv = round(units_sold * product_price, 2)
        gmv_estimated = False
    else:
        gmv = estimate_gmv(views, product_price)
        units_sold = int(views * CONVERSION_RATE)
        gmv_estimated = True

    return {
        "tiktok_video_id":  str(item.get("id") or item.get("videoId") or ""),
        "title":            item.get("text") or item.get("title") or item.get("description") or "",
        "author_username":  item.get("authorMeta", {}).get("name") or item.get("author") or "",
        "author_id":        str(item.get("authorMeta", {}).get("id") or ""),
        "views":            views,
        "likes":            int(item.get("diggCount") or item.get("likes") or 0),
        "shares":           int(item.get("shareCount") or item.get("shares") or 0),
        "comments":         int(item.get("commentCount") or item.get("comments") or 0),
        "gmv_usd":          gmv,
        "gmv_estimated":    gmv_estimated,
        "units_sold":       units_sold,
        "product_name":     item.get("productName") or item.get("product", {}).get("name") or "",
        "product_id":       str(item.get("productId") or item.get("product", {}).get("id") or ""),
        "product_price":    product_price,
        "category":         item.get("categoryName") or "Fashion",
        "region":           TARGET_REGION,
        "video_url":        item.get("webVideoUrl") or item.get("videoUrl") or "",
        "thumbnail_url":    item.get("covers", [None])[0] or item.get("thumbnail") or "",
        "duration_seconds": int(item.get("videoMeta", {}).get("duration") or item.get("duration") or 0),
        "fetched_at":       datetime.now(timezone.utc),
    }


def upsert_video(cur, v: dict):
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
            views         = EXCLUDED.views,
            likes         = EXCLUDED.likes,
            shares        = EXCLUDED.shares,
            comments      = EXCLUDED.comments,
            gmv_usd       = EXCLUDED.gmv_usd,
            gmv_estimated = EXCLUDED.gmv_estimated,
            units_sold    = EXCLUDED.units_sold,
            fetched_at    = EXCLUDED.fetched_at
        """,
        v,
    )


def lambda_handler(event, context):
    logger.info("fetch_videos started")

    raw_items = run_apify_actor()
    videos = [normalize(item) for item in raw_items if item.get("id") or item.get("videoId")]

    # Sort by estimated GMV descending before storing
    videos.sort(key=lambda x: x["gmv_usd"], reverse=True)
    logger.info(f"Normalized {len(videos)} videos (top GMV: ${videos[0]['gmv_usd'] if videos else 0})")

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
