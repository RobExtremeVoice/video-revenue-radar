import type { Video, VideosResponse, KPIs, Trends } from "./types";
import { getMockVideos, getMockVideo, getMockKPIs, getMockTrends } from "./mock-data";

const BASE = import.meta.env.VITE_API_BASE_URL || "https://api.extremeresultsdigital.com";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== "false";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchVideos(params: {
  sort: "gmv" | "viral";
  category?: string;
  period?: string;
  price?: string;
  page?: number;
  limit?: number;
  country?: string;
}): Promise<VideosResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return getMockVideos(params);
  }
  const qs = new URLSearchParams({
    sort: params.sort,
    category: params.category || "all",
    period: params.period || "7d",
    page: String(params.page || 1),
    limit: String(params.limit || 10),
    ...(params.price ? { price: params.price } : {}),
    ...(params.country ? { country: params.country } : {}),
  });
  return fetchJSON(`${BASE}/api/videos?${qs}`);
}

export async function fetchVideo(id: string): Promise<Video> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    const v = getMockVideo(id);
    if (!v) throw new Error("Video not found");
    return v;
  }
  return fetchJSON(`${BASE}/api/videos/${id}`);
}

export async function fetchKPIs(period: string): Promise<KPIs> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return getMockKPIs();
  }
  return fetchJSON(`${BASE}/api/kpis?period=${period}`);
}

export async function fetchTrends(period: string): Promise<Trends> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    return getMockTrends();
  }
  return fetchJSON(`${BASE}/api/trends?period=${period}`);
}

export async function triggerPipeline(): Promise<{ status: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500));
    return { status: "triggered" };
  }
  const res = await fetch(`${BASE}/api/pipeline/trigger`, { method: "POST" });
  if (!res.ok) throw new Error("Pipeline trigger failed");
  return res.json();
}
