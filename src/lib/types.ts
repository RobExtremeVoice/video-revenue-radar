export interface Video {
  id: string;
  tiktok_id: string;
  rank: number;
  title: string;
  creator: string;
  thumbnail_url: string;
  video_url: string;
  product_name: string;
  category: string;
  price_usd: number;
  gmv_estimated: number;
  views: number;
  likes: number;
  saves: number;
  viral_score: number;
  fetched_at: string;
  hook?: string;
  problem?: string;
  solution?: string;
  cta?: string;
  style_tags?: string[];
}

export interface VideosResponse {
  videos: Video[];
  total: number;
  page: number;
  limit: number;
}

export interface KPIs {
  videos_analyzed_today: number;
  videos_trend_pct: number;
  top10_gmv_total: number;
  top10_gmv_trend_pct: number;
  top_category: string;
  top_category_gmv: number;
  best_product_name: string;
  best_product_gmv: number;
}

export interface CategoryGMV {
  category: string;
  gmv: number;
  percentage: number;
}

export interface DailyTrendPoint {
  date: string;
  videos_count: number;
  total_gmv: number;
}

export interface TopHook {
  hook_text: string;
  avg_gmv: number;
  video_count: number;
  top_category: string;
  style_tag: string;
}

export interface Trends {
  gmv_by_category: CategoryGMV[];
  daily_trend: DailyTrendPoint[];
  top_hooks: TopHook[];
}
