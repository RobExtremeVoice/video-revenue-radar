-- Video Revenue Radar — PostgreSQL Schema
-- Run: make setup-db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main videos table
CREATE TABLE IF NOT EXISTS videos (
    id                      SERIAL PRIMARY KEY,
    tiktok_video_id         VARCHAR(64) UNIQUE NOT NULL,

    -- Creator
    author_username         VARCHAR(128),
    author_id               VARCHAR(64),

    -- Content
    title                   TEXT,
    video_url               TEXT,
    thumbnail_url           TEXT,
    duration_seconds        INTEGER DEFAULT 0,

    -- Engagement
    views                   BIGINT DEFAULT 0,
    likes                   BIGINT DEFAULT 0,
    shares                  BIGINT DEFAULT 0,
    comments                BIGINT DEFAULT 0,

    -- Commerce
    gmv_usd                 NUMERIC(12,2) DEFAULT 0,
    gmv_estimated           BOOLEAN DEFAULT TRUE,
    units_sold              INTEGER DEFAULT 0,
    product_name            TEXT,
    product_id              VARCHAR(64),
    product_price           NUMERIC(10,2) DEFAULT 0,
    category                VARCHAR(128) DEFAULT 'Fashion',
    region                  VARCHAR(8) DEFAULT 'US',

    -- AI Analysis
    transcript              TEXT,
    transcript_s3_key       VARCHAR(256),
    hook                    TEXT,
    pain_point              TEXT,
    solution                TEXT,
    cta                     TEXT,
    tone                    VARCHAR(64),
    viral_triggers          JSONB,
    product_positioning     TEXT,
    target_audience         TEXT,
    hook_score              SMALLINT CHECK (hook_score BETWEEN 1 AND 10),
    overall_score           SMALLINT CHECK (overall_score BETWEEN 1 AND 10),

    -- Timestamps
    fetched_at              TIMESTAMPTZ DEFAULT NOW(),
    analysis_completed_at   TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_videos_gmv        ON videos (gmv_usd DESC);
CREATE INDEX IF NOT EXISTS idx_videos_views       ON videos (views DESC);
CREATE INDEX IF NOT EXISTS idx_videos_hook_score  ON videos (hook_score DESC);
CREATE INDEX IF NOT EXISTS idx_videos_fetched_at  ON videos (fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_category    ON videos (category);
CREATE INDEX IF NOT EXISTS idx_videos_region      ON videos (region);
CREATE INDEX IF NOT EXISTS idx_videos_tone        ON videos (tone);
CREATE INDEX IF NOT EXISTS idx_videos_analysis    ON videos (analysis_completed_at) WHERE analysis_completed_at IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_videos_updated_at ON videos;
CREATE TRIGGER trg_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Dashboard view: top videos ready for display
CREATE OR REPLACE VIEW v_dashboard AS
SELECT
    id,
    tiktok_video_id,
    author_username,
    title,
    thumbnail_url,
    video_url,
    duration_seconds,
    views,
    likes,
    gmv_usd,
    gmv_estimated,
    units_sold,
    product_name,
    product_price,
    category,
    hook,
    pain_point,
    cta,
    tone,
    viral_triggers,
    hook_score,
    overall_score,
    fetched_at,
    -- Virality score: normalized composite of views + engagement rate + GMV
    ROUND(
        (
            (LEAST(views, 10000000)::NUMERIC / 10000000) * 40 +
            (LEAST(gmv_usd, 100000)::NUMERIC / 100000) * 40 +
            (COALESCE(hook_score, 5)::NUMERIC / 10) * 20
        )::NUMERIC,
        1
    ) AS virality_score
FROM videos
WHERE analysis_completed_at IS NOT NULL
ORDER BY gmv_usd DESC;

-- Sample data for development/testing
INSERT INTO videos (
    tiktok_video_id, author_username, title, video_url, thumbnail_url,
    views, likes, gmv_usd, units_sold, product_name, product_price, category,
    hook, pain_point, solution, cta, tone, viral_triggers,
    hook_score, overall_score, analysis_completed_at
) VALUES
(
    'SAMPLE_001', 'fashionfinds_us',
    'This $22 dress is going viral for a reason 👗',
    'https://www.tiktok.com/@fashionfinds_us/video/SAMPLE_001',
    'https://placehold.co/400x600/FF6B9D/white?text=Video+1',
    2450000, 180000, 48200, 2190,
    'Floral Wrap Midi Dress', 22.00, 'Women''s Clothing',
    'Wait — this $22 dress is why my DMs are FLOODED right now',
    'Looking stylish without spending a fortune',
    'Affordable dress that looks expensive and fits perfectly',
    'Shop now — link in bio',
    'social_proof',
    '["price_reveal", "dm_mention", "trending_audio"]',
    9, 8, NOW()
),
(
    'SAMPLE_002', 'trendsetterx',
    'I tested 5 viral TikTok Shop outfits — here''s the truth',
    'https://www.tiktok.com/@trendsetterx/video/SAMPLE_002',
    'https://placehold.co/400x600/9B59B6/white?text=Video+2',
    1820000, 95000, 31500, 1500,
    'Linen Co-ord Set', 38.00, 'Women''s Clothing',
    'I bought 5 viral TikTok Shop sets so you don''t have to',
    'Wasting money on items that look bad in person',
    'Honest review with only the best picks highlighted',
    'Comment SIZE for the link',
    'educational',
    '["honest_review", "comment_cta", "comparison"]',
    8, 9, NOW()
),
(
    'SAMPLE_003', 'stylebyamy',
    'GRWM for a girls night using only TikTok Shop finds ✨',
    'https://www.tiktok.com/@stylebyamy/video/SAMPLE_003',
    'https://placehold.co/400x600/F39C12/white?text=Video+3',
    3100000, 220000, 62000, 2800,
    'Sequin Mini Dress', 45.00, 'Women''s Clothing',
    'Getting ready for girls night using only TikTok Shop — let''s go',
    'Not knowing what to wear for a night out',
    'Complete outfit from TikTok Shop under $100',
    'Follow for more outfit inspo',
    'entertaining',
    '["grwm_format", "trending_audio", "outfit_reveal"]',
    9, 9, NOW()
)
ON CONFLICT (tiktok_video_id) DO NOTHING;
