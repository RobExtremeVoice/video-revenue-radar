import type { Video, KPIs, Trends } from "./types";

const mockVideos: Video[] = [
  {
    id: "v1", tiktok_id: "tt001", rank: 1,
    title: "POV: you found the dress that actually flatters your body type",
    creator: "@fashionwithkay", thumbnail_url: "https://picsum.photos/seed/v1/300/200",
    video_url: "https://www.tiktok.com/@fashionwithkay/video/1", product_name: "Ribbed Bodycon Midi Dress",
    category: "Dresses", price_usd: 34.99, gmv_estimated: 48200, views: 4200000, likes: 312000, saves: 89000,
    viral_score: 96, fetched_at: "2026-03-28T06:00:00Z",
    hook: "POV: you found the dress that actually flatters your body type",
    problem: "Most midi dresses look frumpy on petite frames",
    solution: "This ribbed bodycon has princess seams that cinch in all the right spots",
    cta: "Link in bio — selling out fast, only 3 colors left",
    style_tags: ["transformation", "before_after", "urgency", "social_proof"],
  },
  {
    id: "v2", tiktok_id: "tt002", rank: 2,
    title: "This $28 top is everywhere on TikTok and I finally tried it",
    creator: "@styledbymia", thumbnail_url: "https://picsum.photos/seed/v2/300/200",
    video_url: "https://www.tiktok.com/@styledbymia/video/2", product_name: "Ruched Mesh Top",
    category: "Tops", price_usd: 28.00, gmv_estimated: 38500, views: 3100000, likes: 245000, saves: 67000,
    viral_score: 91, fetched_at: "2026-03-28T06:00:00Z",
    hook: "This $28 top is everywhere on TikTok and I finally tried it",
    problem: "Mesh tops usually look cheap and see-through",
    solution: "Double-layer ruched mesh with built-in lining",
    cta: "TikTok Shop link below — use code STYLE20",
    style_tags: ["trend_test", "social_proof", "price_mention"],
  },
  {
    id: "v3", tiktok_id: "tt003", rank: 3,
    title: "The linen pants that make everyone ask where I got them",
    creator: "@ootd.daily", thumbnail_url: "https://picsum.photos/seed/v3/300/200",
    video_url: "https://www.tiktok.com/@ootd.daily/video/3", product_name: "Linen Wide-Leg Pants",
    category: "Bottoms", price_usd: 42.00, gmv_estimated: 31200, views: 2800000, likes: 198000, saves: 54000,
    viral_score: 88, fetched_at: "2026-03-28T06:00:00Z",
    hook: "The linen pants that make everyone ask where I got them",
    problem: "Wide-leg pants often look sloppy and wrinkled",
    solution: "Pre-washed linen with structured waistband and deep pockets",
    cta: "Tap the orange basket — sizes XS to 3XL",
    style_tags: ["social_proof", "compliment_bait", "size_inclusive"],
  },
  {
    id: "v4", tiktok_id: "tt004", rank: 4,
    title: "Styling the viral square toe mules 5 ways",
    creator: "@heelgamestrong", thumbnail_url: "https://picsum.photos/seed/v4/300/200",
    video_url: "https://www.tiktok.com/@heelgamestrong/video/4", product_name: "Square Toe Mule Heels",
    category: "Footwear", price_usd: 55.00, gmv_estimated: 27800, views: 2100000, likes: 167000, saves: 73000,
    viral_score: 85, fetched_at: "2026-03-28T06:00:00Z",
    hook: "5 ways to style the shoe that broke the internet",
    problem: "Finding heels that are both trendy and walkable",
    solution: "Padded insole with block heel design — style meets comfort",
    cta: "Add to cart before they sell out again",
    style_tags: ["styling_tips", "versatility", "urgency"],
  },
  {
    id: "v5", tiktok_id: "tt005", rank: 5,
    title: "I wore this dress to a wedding and got more compliments than the bride",
    creator: "@glambylex", thumbnail_url: "https://picsum.photos/seed/v5/300/200",
    video_url: "https://www.tiktok.com/@glambylex/video/5", product_name: "Satin Slip Maxi Dress",
    category: "Dresses", price_usd: 62.00, gmv_estimated: 24100, views: 1900000, likes: 142000, saves: 48000,
    viral_score: 82, fetched_at: "2026-03-28T06:00:00Z",
    hook: "I wore this to a wedding and got more compliments than the bride 💅",
    problem: "Wedding guest dresses are either boring or too expensive",
    solution: "Satin slip dress with adjustable straps and cowl neck under $65",
    cta: "Link pinned in comments — 4 colors available",
    style_tags: ["compliment_bait", "occasion_wear", "price_mention"],
  },
  {
    id: "v6", tiktok_id: "tt006", rank: 6,
    title: "The gold chain belt that elevates literally any outfit",
    creator: "@accessorize.me", thumbnail_url: "https://picsum.photos/seed/v6/300/200",
    video_url: "https://www.tiktok.com/@accessorize.me/video/6", product_name: "Layered Gold Chain Belt",
    category: "Accessories", price_usd: 18.99, gmv_estimated: 19800, views: 1600000, likes: 121000, saves: 61000,
    viral_score: 79, fetched_at: "2026-03-28T06:00:00Z",
    hook: "The $19 accessory that makes everything look expensive",
    problem: "Basic outfits need something extra without overdoing it",
    solution: "Layered chain belt that can be worn 3 different ways",
    cta: "Shop through TikTok Shop — free returns",
    style_tags: ["transformation", "price_mention", "versatility"],
  },
  {
    id: "v7", tiktok_id: "tt007", rank: 7,
    title: "Testing the cropped blazer that's all over my FYP",
    creator: "@workwearqueen", thumbnail_url: "https://picsum.photos/seed/v7/300/200",
    video_url: "https://www.tiktok.com/@workwearqueen/video/7", product_name: "Cropped Double-Breasted Blazer",
    category: "Outerwear", price_usd: 59.00, gmv_estimated: 16400, views: 1400000, likes: 98000, saves: 42000,
    viral_score: 76, fetched_at: "2026-03-28T06:00:00Z",
    hook: "The blazer that took my work outfits from boring to boardroom chic",
    problem: "Blazers either look too corporate or too casual",
    solution: "Cropped double-breasted cut with shoulder pads for structure",
    cta: "Linked below — runs TTS, I'm wearing a Small",
    style_tags: ["workwear", "trend_test", "size_guide"],
  },
  {
    id: "v8", tiktok_id: "tt008", rank: 8,
    title: "This bikini made me actually confident at the beach",
    creator: "@beachbodylove", thumbnail_url: "https://picsum.photos/seed/v8/300/200",
    video_url: "https://www.tiktok.com/@beachbodylove/video/8", product_name: "High-Waist Ribbed Bikini Set",
    category: "Swimwear", price_usd: 32.00, gmv_estimated: 14200, views: 1200000, likes: 89000, saves: 38000,
    viral_score: 73, fetched_at: "2026-03-28T06:00:00Z",
    hook: "The bikini that made me cancel my gym membership (just kidding but fr)",
    problem: "Most bikinis either show too much or have zero support",
    solution: "High-waist bottom with ribbed texture and underwire top",
    cta: "Tap the link — summer is coming and so is the sellout",
    style_tags: ["body_positive", "humor", "urgency"],
  },
  {
    id: "v9", tiktok_id: "tt009", rank: 9,
    title: "Rating TikTok's most viral cargo pants",
    creator: "@streetstylefiles", thumbnail_url: "https://picsum.photos/seed/v9/300/200",
    video_url: "https://www.tiktok.com/@streetstylefiles/video/9", product_name: "Utility Cargo Joggers",
    category: "Bottoms", price_usd: 36.00, gmv_estimated: 12100, views: 980000, likes: 76000, saves: 31000,
    viral_score: 70, fetched_at: "2026-03-28T06:00:00Z",
    hook: "Rating the cargo pants that have 10K 5-star reviews",
    problem: "Cargo pants trend but most are stiff and boxy",
    solution: "Tapered jogger fit with functional flap pockets",
    cta: "Link in bio — comes in 6 colors",
    style_tags: ["review", "social_proof", "trend_test"],
  },
  {
    id: "v10", tiktok_id: "tt010", rank: 10,
    title: "The platform sneakers giving 90s Spice Girls energy",
    creator: "@retrovibesonly", thumbnail_url: "https://picsum.photos/seed/v10/300/200",
    video_url: "https://www.tiktok.com/@retrovibesonly/video/10", product_name: "Chunky Platform Sneakers",
    category: "Footwear", price_usd: 48.00, gmv_estimated: 9800, views: 820000, likes: 64000, saves: 27000,
    viral_score: 67, fetched_at: "2026-03-28T06:00:00Z",
    hook: "If you're a 90s kid, you NEED these sneakers",
    problem: "Platform shoes are trendy but usually uncomfortable for walking",
    solution: "Memory foam insole with lightweight EVA platform",
    cta: "TikTok Shop exclusive — not available anywhere else",
    style_tags: ["nostalgia", "exclusive", "comfort"],
  },
  {
    id: "v11", tiktok_id: "tt011", rank: 11,
    title: "Turning a basic white tee into a $200 looking outfit",
    creator: "@minimalistchic", thumbnail_url: "https://picsum.photos/seed/v11/300/200",
    video_url: "https://www.tiktok.com/@minimalistchic/video/11", product_name: "Oversized Pima Cotton Tee",
    category: "Tops", price_usd: 22.00, gmv_estimated: 8400, views: 740000, likes: 58000, saves: 24000,
    viral_score: 64, fetched_at: "2026-03-28T06:00:00Z",
    hook: "How to make a $22 tee look like a $200 outfit", problem: "Basic tees look too casual",
    solution: "Oversized cut in heavyweight pima cotton with dropped shoulders",
    cta: "Shop below — size up for the oversized look",
    style_tags: ["styling_tips", "budget_luxury", "transformation"],
  },
  {
    id: "v12", tiktok_id: "tt012", rank: 12,
    title: "The corset top that actually fits big busts",
    creator: "@curvystyled", thumbnail_url: "https://picsum.photos/seed/v12/300/200",
    video_url: "https://www.tiktok.com/@curvystyled/video/12", product_name: "Structured Corset Top",
    category: "Tops", price_usd: 38.00, gmv_estimated: 7200, views: 650000, likes: 51000, saves: 22000,
    viral_score: 61, fetched_at: "2026-03-28T06:00:00Z",
    hook: "Finally a corset top designed for D+ cups", problem: "Corset tops gap at the bust",
    solution: "Boned structure with adjustable bust darts and hook-eye back",
    cta: "Link below — 30-day returns if it doesn't fit",
    style_tags: ["size_inclusive", "body_positive", "solution"],
  },
  {
    id: "v13", tiktok_id: "tt013", rank: 13,
    title: "Mini bag vs maxi bag — which wins?",
    creator: "@bagobsessed", thumbnail_url: "https://picsum.photos/seed/v13/300/200",
    video_url: "https://www.tiktok.com/@bagobsessed/video/13", product_name: "Quilted Crossbody Mini Bag",
    category: "Accessories", price_usd: 26.00, gmv_estimated: 6100, views: 540000, likes: 43000, saves: 19000,
    viral_score: 58, fetched_at: "2026-03-28T06:00:00Z",
    hook: "Mini vs Maxi bag showdown — the winner surprised me", problem: "Picking the right bag size",
    solution: "Mini crossbody fits phone, cards, keys — all you actually need",
    cta: "Both linked below — which team are you?",
    style_tags: ["comparison", "engagement_bait", "practical"],
  },
  {
    id: "v14", tiktok_id: "tt014", rank: 14,
    title: "Trench coat outfit ideas for spring",
    creator: "@springlooks", thumbnail_url: "https://picsum.photos/seed/v14/300/200",
    video_url: "https://www.tiktok.com/@springlooks/video/14", product_name: "Classic Belted Trench Coat",
    category: "Outerwear", price_usd: 72.00, gmv_estimated: 5400, views: 480000, likes: 37000, saves: 16000,
    viral_score: 55, fetched_at: "2026-03-28T06:00:00Z",
    hook: "7 trench coat outfits that scream main character energy", problem: "Trench coats feel outdated",
    solution: "Modern belted cut with water-resistant fabric and oversized lapels",
    cta: "Spring must-have — shop the link",
    style_tags: ["styling_tips", "seasonal", "versatility"],
  },
  {
    id: "v15", tiktok_id: "tt015", rank: 15,
    title: "Are $24 sunglasses worth it? Testing viral shades",
    creator: "@sunglassreview", thumbnail_url: "https://picsum.photos/seed/v15/300/200",
    video_url: "https://www.tiktok.com/@sunglassreview/video/15", product_name: "Retro Cat-Eye Sunglasses",
    category: "Accessories", price_usd: 24.00, gmv_estimated: 4800, views: 420000, likes: 33000, saves: 14000,
    viral_score: 52, fetched_at: "2026-03-28T06:00:00Z",
    hook: "Testing the sunglasses with 50K orders on TikTok Shop", problem: "Cheap sunglasses look and feel cheap",
    solution: "UV400 polarized lenses with acetate frames — designer dupe",
    cta: "Under $25 — link in bio",
    style_tags: ["review", "dupe", "price_mention"],
  },
  {
    id: "v16", tiktok_id: "tt016", rank: 16,
    title: "The matching set that's basically pajamas but make it fashion",
    creator: "@comfyglam", thumbnail_url: "https://picsum.photos/seed/v16/300/200",
    video_url: "https://www.tiktok.com/@comfyglam/video/16", product_name: "Knit Lounge Set",
    category: "Tops", price_usd: 45.00, gmv_estimated: 3900, views: 360000, likes: 28000, saves: 12000,
    viral_score: 49, fetched_at: "2026-03-28T06:00:00Z",
    hook: "When your pajamas get more compliments than your going-out outfit", problem: "Loungewear not street appropriate",
    solution: "Ribbed knit set with structured shoulders — elevated casual",
    cta: "Comfy AND cute — shop now",
    style_tags: ["humor", "comfort", "versatility"],
  },
  {
    id: "v17", tiktok_id: "tt017", rank: 17,
    title: "Cowboy boots with everything — spring edition",
    creator: "@westernchic", thumbnail_url: "https://picsum.photos/seed/v17/300/200",
    video_url: "https://www.tiktok.com/@westernchic/video/17", product_name: "Pointed Western Ankle Boots",
    category: "Footwear", price_usd: 68.00, gmv_estimated: 3200, views: 290000, likes: 22000, saves: 10000,
    viral_score: 46, fetched_at: "2026-03-28T06:00:00Z",
    hook: "Proof that cowboy boots go with literally everything", problem: "Western boots feel costume-y",
    solution: "Sleek pointed toe with subtle stitching — modern western",
    cta: "Spring's biggest trend — grab them now",
    style_tags: ["styling_tips", "trend_test", "seasonal"],
  },
  {
    id: "v18", tiktok_id: "tt018", rank: 18,
    title: "Wrap dress hack for when nothing fits right",
    creator: "@dresshacks", thumbnail_url: "https://picsum.photos/seed/v18/300/200",
    video_url: "https://www.tiktok.com/@dresshacks/video/18", product_name: "Jersey Wrap Mini Dress",
    category: "Dresses", price_usd: 29.99, gmv_estimated: 2600, views: 240000, likes: 18000, saves: 8000,
    viral_score: 43, fetched_at: "2026-03-28T06:00:00Z",
    hook: "The wrap dress hack nobody talks about", problem: "Wrap dresses gap open or feel insecure",
    solution: "Internal snap closure so it stays perfectly wrapped",
    cta: "Problem solved — link below",
    style_tags: ["hack", "solution", "practical"],
  },
  {
    id: "v19", tiktok_id: "tt019", rank: 19,
    title: "Building a capsule wardrobe for under $200",
    creator: "@budgetstyle", thumbnail_url: "https://picsum.photos/seed/v19/300/200",
    video_url: "https://www.tiktok.com/@budgetstyle/video/19", product_name: "Tailored High-Rise Trousers",
    category: "Bottoms", price_usd: 38.00, gmv_estimated: 1800, views: 195000, likes: 15000, saves: 7000,
    viral_score: 40, fetched_at: "2026-03-28T06:00:00Z",
    hook: "Full capsule wardrobe under $200 — here's piece #1", problem: "Wardrobes feel chaotic and expensive",
    solution: "High-rise tailored trousers that pair with everything",
    cta: "Start your capsule — all 7 pieces linked",
    style_tags: ["capsule_wardrobe", "budget_luxury", "practical"],
  },
  {
    id: "v20", tiktok_id: "tt020", rank: 20,
    title: "Silk scarf styling tutorial — 4 looks in 60 seconds",
    creator: "@scarfqueen", thumbnail_url: "https://picsum.photos/seed/v20/300/200",
    video_url: "https://www.tiktok.com/@scarfqueen/video/20", product_name: "Printed Silk Hair Scarf",
    category: "Accessories", price_usd: 15.99, gmv_estimated: 1200, views: 180000, likes: 14000, saves: 6500,
    viral_score: 37, fetched_at: "2026-03-28T06:00:00Z",
    hook: "4 ways to wear a silk scarf in under 60 seconds", problem: "Scarves feel old-fashioned",
    solution: "Modern prints with versatile sizing — headband, bag charm, belt, necktie",
    cta: "Only $16 — link in bio",
    style_tags: ["styling_tips", "versatility", "price_mention"],
  },
];

export function getMockVideos(params: {
  sort: "gmv" | "viral";
  category?: string;
  period?: string;
  price?: string;
  page?: number;
  limit?: number;
}) {
  let filtered = [...mockVideos];

  if (params.category && params.category !== "all") {
    filtered = filtered.filter((v) => v.category === params.category);
  }

  if (params.price) {
    if (params.price === "under30") filtered = filtered.filter((v) => v.price_usd < 30);
    else if (params.price === "30to80") filtered = filtered.filter((v) => v.price_usd >= 30 && v.price_usd <= 80);
    else if (params.price === "above80") filtered = filtered.filter((v) => v.price_usd > 80);
  }

  if (params.sort === "gmv") {
    filtered.sort((a, b) => b.gmv_estimated - a.gmv_estimated);
  } else {
    filtered.sort((a, b) => b.viral_score - a.viral_score);
  }

  filtered = filtered.map((v, i) => ({ ...v, rank: i + 1 }));

  const page = params.page || 1;
  const limit = params.limit || 10;
  const start = (page - 1) * limit;

  return {
    videos: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
}

export function getMockVideo(id: string): Video | undefined {
  return mockVideos.find((v) => v.id === id);
}

export function getMockKPIs(): KPIs {
  return {
    videos_analyzed_today: 147,
    videos_trend_pct: 12.3,
    top10_gmv_total: 232100,
    top10_gmv_trend_pct: 8.7,
    top_category: "Dresses",
    top_category_gmv: 74900,
    best_product_name: "Ribbed Bodycon Midi Dress",
    best_product_gmv: 48200,
  };
}

export function getMockTrends(): Trends {
  const categories = ["Tops", "Dresses", "Bottoms", "Footwear", "Accessories", "Outerwear", "Swimwear"];
  const gmvValues = [57100, 74900, 45100, 40800, 31900, 21800, 14200];

  const totalGMV = gmvValues.reduce((a, b) => a + b, 0);

  const gmv_by_category = categories.map((cat, i) => ({
    category: cat,
    gmv: gmvValues[i],
    percentage: Math.round((gmvValues[i] / totalGMV) * 100),
  }));

  const daily_trend: { date: string; videos_count: number; total_gmv: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    daily_trend.push({
      date: d.toISOString().split("T")[0],
      videos_count: Math.floor(Math.random() * 40) + 80,
      total_gmv: Math.floor(Math.random() * 30000) + 50000,
    });
  }

  const top_hooks = [
    { hook_text: "POV: you found the [product] that actually [benefit]", avg_gmv: 32400, video_count: 18, top_category: "Dresses", style_tag: "transformation" },
    { hook_text: "This $XX [product] is everywhere on TikTok", avg_gmv: 28100, video_count: 24, top_category: "Tops", style_tag: "social_proof" },
    { hook_text: "I wore this to [event] and got more compliments than [person]", avg_gmv: 22800, video_count: 12, top_category: "Dresses", style_tag: "compliment_bait" },
    { hook_text: "The [product] that makes everyone ask where I got it", avg_gmv: 19600, video_count: 15, top_category: "Bottoms", style_tag: "social_proof" },
    { hook_text: "Rating the [product] with XX,000 5-star reviews", avg_gmv: 16200, video_count: 21, top_category: "Accessories", style_tag: "review" },
    { hook_text: "If you're a [identity], you NEED this", avg_gmv: 14800, video_count: 9, top_category: "Footwear", style_tag: "identity" },
    { hook_text: "How to make a $XX [product] look like $XXX", avg_gmv: 11200, video_count: 16, top_category: "Tops", style_tag: "budget_luxury" },
  ];

  return { gmv_by_category, daily_trend, top_hooks };
}
