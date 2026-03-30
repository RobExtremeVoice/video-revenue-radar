import { useQuery } from "@tanstack/react-query";
import { fetchTrends } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { formatCurrency, formatNumber, getCategoryColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Line, CartesianGrid, Legend,
} from "recharts";

export default function Trends() {
  const { data, isLoading } = useQuery({
    queryKey: ["trends", "30d"],
    queryFn: () => fetchTrends("30d"),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Layout>
      <div className="p-6 max-w-[1400px] mx-auto space-y-8">
        <h1 className="text-xl font-bold text-foreground-strong">Trends & Analysis</h1>

        {/* GMV by Category */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground-strong mb-4">GMV by Fashion Category</h2>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.gmv_by_category}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "GMV"]}
                  labelFormatter={(label) => `Category: ${label}`}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(42, 14%, 81%)", fontSize: 12 }}
                />
                <Bar dataKey="gmv" fill="hsl(247, 42%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Daily Pipeline Output */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground-strong mb-4">Daily Pipeline Output</h2>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data?.daily_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(42, 14%, 81%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "Videos", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} label={{ value: "GMV", angle: 90, position: "insideRight", style: { fontSize: 11 } }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(42, 14%, 81%)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="videos_count" stroke="hsl(247, 42%, 50%)" name="Videos" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="total_gmv" stroke="hsl(159, 76%, 25%)" name="GMV" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Hooks Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground-strong">Most Effective Hooks This Period</h2>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Hook Pattern</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Avg GMV</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Videos</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Top Category</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.top_hooks.map((hook, i) => {
                    const catColor = getCategoryColor(hook.top_category);
                    return (
                      <tr key={i} className={`border-b border-border ${i % 2 === 1 ? "bg-muted/50" : ""}`}>
                        <td className="px-4 py-3 text-sm text-foreground-strong">{hook.hook_text}</td>
                        <td className="px-4 py-3 text-sm font-medium text-teal">{formatCurrency(hook.avg_gmv)}</td>
                        <td className="px-4 py-3 text-sm text-foreground-strong">{hook.video_count}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded ${catColor.bg}`}>{hook.top_category}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
