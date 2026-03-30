import { useQuery } from "@tanstack/react-query";
import { fetchKPIs } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getCategoryColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

function TrendIndicator({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-teal" : "text-coral"}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function KPIBar({ period, country }: { period: string; country: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["kpis", period, country],
    queryFn: () => fetchKPIs(period, country),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-muted p-4">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-7 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const catColor = getCategoryColor(data.top_category);

  const cards = [
    {
      label: "Videos Analyzed Today",
      value: formatNumber(data.videos_analyzed_today),
      trend: data.videos_trend_pct,
    },
    {
      label: "Top 10 GMV Total",
      value: formatCurrency(data.top10_gmv_total),
      trend: data.top10_gmv_trend_pct,
    },
    {
      label: "Top Category",
      value: data.top_category,
      badge: catColor,
      sub: formatCurrency(data.top_category_gmv),
    },
    {
      label: "Best Product",
      value: data.best_product_name.length > 28 ? data.best_product_name.slice(0, 28) + "…" : data.best_product_name,
      sub: formatCurrency(data.best_product_gmv),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="rounded-lg border border-border bg-muted p-4">
          <div className="text-xs text-muted-foreground mb-1">{card.label}</div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground-strong">{card.value}</span>
            {card.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${card.badge.bg}`}>{""}</span>
            )}
          </div>
          {card.trend !== undefined && <TrendIndicator value={card.trend} />}
          {card.sub && <div className="text-xs text-muted-foreground mt-0.5">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
