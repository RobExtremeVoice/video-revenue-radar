"""
query — REST API handler for the dashboard.
Routes: GET /videos, GET /videos/{id}, GET /trends
"""
import json
import os
import logging
import psycopg2
import psycopg2.extras

logger = logging.getLogger()
logger.setLevel(logging.INFO)

DB_HOST     = os.environ["DB_HOST"]
DB_NAME     = os.environ["DB_NAME"]
DB_USER     = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]


def get_db():
    return psycopg2.connect(
        host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, connect_timeout=10
    )


def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Api-Key",
        },
        "body": json.dumps(body, default=str),
    }


def get_videos(params: dict):
    sort_by  = params.get("sort_by", "gmv_usd")
    order    = "DESC" if params.get("order", "desc") == "desc" else "ASC"
    limit    = min(int(params.get("limit", 50)), 200)
    offset   = int(params.get("offset", 0))
    category = params.get("category")
    min_gmv  = params.get("min_gmv")
    search   = params.get("search")

    # Whitelist sort columns to prevent injection
    allowed_sorts = {"gmv_usd", "views", "likes", "units_sold", "hook_score", "overall_score", "fetched_at"}
    if sort_by not in allowed_sorts:
        sort_by = "gmv_usd"

    where_clauses = ["analysis_completed_at IS NOT NULL"]
    bind_params = []

    if category:
        where_clauses.append("category = %s")
        bind_params.append(category)
    if min_gmv:
        where_clauses.append("gmv_usd >= %s")
        bind_params.append(float(min_gmv))
    if search:
        where_clauses.append("(title ILIKE %s OR product_name ILIKE %s OR author_username ILIKE %s)")
        term = f"%{search}%"
        bind_params.extend([term, term, term])

    where_sql = "WHERE " + " AND ".join(where_clauses)

    sql = f"""
        SELECT
            id, tiktok_video_id, title, author_username,
            views, likes, shares, comments,
            gmv_usd, gmv_estimated, units_sold,
            product_name, product_price, category,
            video_url, thumbnail_url, duration_seconds,
            hook, pain_point, solution, cta, tone,
            viral_triggers, hook_score, overall_score,
            fetched_at
        FROM videos
        {where_sql}
        ORDER BY {sort_by} {order}
        LIMIT %s OFFSET %s
    """
    bind_params.extend([limit, offset])

    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, bind_params)
            rows = cur.fetchall()
            cur.execute(f"SELECT COUNT(*) FROM videos {where_sql}", bind_params[:-2])
            total = cur.fetchone()["count"]
    finally:
        conn.close()

    return response(200, {"data": list(rows), "total": total, "limit": limit, "offset": offset})


def get_video_detail(video_id: str):
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM videos WHERE tiktok_video_id = %s", (video_id,))
            row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return response(404, {"error": "Video not found"})
    return response(200, dict(row))


def get_trends():
    sql = """
        SELECT
            DATE_TRUNC('day', fetched_at)   AS date,
            COUNT(*)                         AS video_count,
            AVG(gmv_usd)                     AS avg_gmv,
            SUM(gmv_usd)                     AS total_gmv,
            AVG(views)                       AS avg_views,
            AVG(hook_score)                  AS avg_hook_score,
            tone,
            COUNT(*) FILTER (WHERE gmv_usd > 10000) AS viral_count
        FROM videos
        WHERE fetched_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', fetched_at), tone
        ORDER BY date DESC
    """
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql)
            rows = cur.fetchall()
    finally:
        conn.close()

    return response(200, {"data": list(rows)})


def lambda_handler(event, context):
    path   = event.get("path", "/")
    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    path_params = event.get("pathParameters") or {}

    if method != "GET":
        return response(405, {"error": "Method not allowed"})

    if path == "/videos" or path == "/videos/":
        return get_videos(params)
    elif path.startswith("/videos/") and path_params.get("video_id"):
        return get_video_detail(path_params["video_id"])
    elif path == "/trends":
        return get_trends()
    else:
        return response(404, {"error": "Not found"})
