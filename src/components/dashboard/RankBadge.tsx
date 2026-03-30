import { Star } from "lucide-react";

export function RankBadge({ rank }: { rank: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="font-bold text-foreground-strong">{rank}</span>
      {rank === 1 && <Star className="h-4 w-4 text-amber fill-amber" />}
    </div>
  );
}
