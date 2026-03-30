import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchVideo } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { formatCurrency, formatNumber, getCategoryColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Play, Sparkles, ExternalLink } from "lucide-react";

const analysisItems = [
  { key: "hook" as const, label: "HOOK", borderColor: "border-l-primary" },
  { key: "problem" as const, label: "PROBLEM", borderColor: "border-l-coral" },
  { key: "solution" as const, label: "SOLUTION", borderColor: "border-l-teal" },
  { key: "cta" as const, label: "CTA", borderColor: "border-l-amber" },
];

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: video, isLoading, error } = useQuery({
    queryKey: ["video", id],
    queryFn: () => fetchVideo(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 max-w-[1200px] mx-auto">
          <Skeleton className="h-8 w-40 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !video) {
    return (
      <Layout>
        <div className="p-6 max-w-[1200px] mx-auto text-center py-20">
          <h2 className="text-foreground-strong font-medium mb-2">Video not found</h2>
          <Button variant="outline" onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const catColor = getCategoryColor(video.category);

  return (
    <Layout>
      <div className="p-6 max-w-[1200px] mx-auto">
        <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-5">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={video.thumbnail_url} alt={video.title} className="w-full aspect-video object-cover" />
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-foreground-strong/20 hover:bg-foreground-strong/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-card/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-foreground-strong fill-foreground-strong ml-0.5" />
                </div>
              </a>
            </div>

            <div>
              <h1 className="text-lg font-bold text-foreground-strong mb-1">{video.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{video.creator}</span>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                  Open on TikTok <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-medium text-foreground-strong mb-1">{video.product_name}</div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] px-2 py-0.5 rounded ${catColor.bg}`}>{video.category}</span>
                <span className="text-sm text-muted-foreground">${video.price_usd.toFixed(2)}</span>
              </div>
              <div className="text-2xl font-bold text-teal mt-3">{formatCurrency(video.gmv_estimated)}</div>
              <div className="text-xs text-muted-foreground">Estimated GMV</div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground-strong">AI Analysis</h2>
            </div>

            {analysisItems.map((item) => {
              const content = video[item.key];
              if (!content) return null;
              return (
                <div key={item.key} className={`rounded-lg border border-border bg-card p-4 border-l-4 ${item.borderColor}`}>
                  <div className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-1">{item.label}</div>
                  <div className="text-sm text-foreground-strong">{content}</div>
                </div>
              );
            })}

            {video.style_tags && video.style_tags.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">Style Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {video.style_tags.map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-1 rounded-md bg-primary-light text-primary font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs text-muted-foreground mb-1">GMV Estimated</div>
                <div className="text-lg font-bold text-teal">{formatCurrency(video.gmv_estimated)}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs text-muted-foreground mb-1">Views</div>
                <div className="text-lg font-bold text-foreground-strong">{formatNumber(video.views)}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs text-muted-foreground mb-1">Likes</div>
                <div className="text-lg font-bold text-foreground-strong">{formatNumber(video.likes)}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs text-muted-foreground mb-1">Viral Score</div>
                <div className="flex items-center gap-2">
                  <Progress value={video.viral_score} className="h-2 flex-1" />
                  <span className="text-sm font-bold text-foreground-strong">{video.viral_score}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
