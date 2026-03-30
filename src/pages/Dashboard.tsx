import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchVideos } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { KPIBar } from "@/components/dashboard/KPIBar";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { VideoTable } from "@/components/dashboard/VideoTable";
import type { Video } from "@/lib/types";

function downloadCSV(videos: Video[]) {
  const headers = ["Rank", "Creator", "Product", "Category", "Price", "GMV Est", "Views", "Viral Score", "Hook", "CTA"];
  const rows = videos.map((v) => [
    v.rank, v.creator, v.product_name, v.category,
    `$${v.price_usd.toFixed(2)}`, `$${v.gmv_estimated}`,
    v.views, v.viral_score, v.hook || "", v.cta || "",
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tiktok-fashion-ranking.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [country, setCountry] = useState("US");
  const [sort, setSort] = useState<"gmv" | "viral">("gmv");
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("7d");
  const [price, setPrice] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["videos", country, sort, category, period, price, page],
    queryFn: () =>
      fetchVideos({
        sort,
        category: category === "all" ? undefined : category,
        period,
        price: price === "all" ? undefined : price,
        page,
        limit: 10,
        country,
      }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Layout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <h1 className="text-xl font-bold text-foreground-strong mb-6">Video Ranking</h1>

        <KPIBar period={period} country={country} />

        <FilterBar
          country={country}
          onCountryChange={(v) => { setCountry(v); setPage(1); }}
          sort={sort}
          onSortChange={(v) => { setSort(v); setPage(1); }}
          category={category}
          onCategoryChange={(v) => { setCategory(v); setPage(1); }}
          period={period}
          onPeriodChange={(v) => { setPeriod(v); setPage(1); }}
          price={price}
          onPriceChange={(v) => { setPrice(v); setPage(1); }}
          onExport={() => data?.videos && downloadCSV(data.videos)}
        />

        <VideoTable
          videos={data?.videos || []}
          isLoading={isLoading}
          page={page}
          total={data?.total || 0}
          limit={10}
          onPageChange={setPage}
        />
      </div>
    </Layout>
  );
}
