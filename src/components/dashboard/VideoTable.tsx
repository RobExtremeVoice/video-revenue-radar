import { useNavigate } from "react-router-dom";
import type { Video } from "@/lib/types";
import { formatCurrency, formatNumber, getCategoryColor } from "@/lib/utils";
import { RankBadge } from "./RankBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye } from "lucide-react";

interface VideoTableProps {
  videos: Video[];
  isLoading: boolean;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function VideoTable({ videos, isLoading, page, total, limit, onPageChange }: VideoTableProps) {
  const navigate = useNavigate();
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Video</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">GMV Est.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Views</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Viral Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-lg" /><div><Skeleton className="h-4 w-40 mb-1" /><Skeleton className="h-3 w-24" /></div></div></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-14" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-14" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-foreground-strong font-medium mb-1">No videos found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground min-w-[280px]">Video</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground min-w-[180px]">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-20">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-28">GMV Est.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-24">Views</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-28">Viral Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video, i) => {
              const catColor = getCategoryColor(video.category);
              const isTop3 = video.rank <= 3;
              return (
                <tr
                  key={video.id}
                  onClick={() => navigate(`/video/${video.id}`)}
                  className={`border-b border-border cursor-pointer transition-colors hover:bg-primary-light ${
                    i % 2 === 1 ? "bg-muted/50" : "bg-card"
                  } ${isTop3 ? "border-l-[3px] border-l-primary" : ""}`}
                >
                  <td className="px-4 py-3"><RankBadge rank={video.rank} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={video.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground-strong truncate max-w-[220px]">{video.title}</div>
                        <div className="text-xs text-muted-foreground">{video.creator}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground-strong">{video.product_name}</div>
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded mt-0.5 ${catColor.bg}`}>{video.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-strong">${video.price_usd.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${isTop3 ? "text-teal" : "text-foreground-strong"}`}>
                      {formatCurrency(video.gmv_estimated)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-strong">{formatNumber(video.views)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={video.viral_score} className="h-1.5 w-14" />
                      <span className="text-xs font-medium text-foreground-strong">{video.viral_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={(e) => { e.stopPropagation(); navigate(`/video/${video.id}`); }}>
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden divide-y divide-border">
        {videos.map((video) => {
          const catColor = getCategoryColor(video.category);
          return (
            <div
              key={video.id}
              onClick={() => navigate(`/video/${video.id}`)}
              className="p-4 cursor-pointer hover:bg-primary-light transition-colors"
            >
              <div className="flex items-start gap-3">
                <img src={video.thumbnail_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <RankBadge rank={video.rank} />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${catColor.bg}`}>{video.category}</span>
                  </div>
                  <div className="text-sm font-medium text-foreground-strong truncate">{video.title}</div>
                  <div className="text-xs text-muted-foreground">{video.creator}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="font-bold text-teal">{formatCurrency(video.gmv_estimated)}</span>
                    <span className="text-muted-foreground">{formatNumber(video.views)} views</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({total} videos)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
