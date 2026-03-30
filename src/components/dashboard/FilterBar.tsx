import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface FilterBarProps {
  sort: "gmv" | "viral";
  onSortChange: (v: "gmv" | "viral") => void;
  category: string;
  onCategoryChange: (v: string) => void;
  period: string;
  onPeriodChange: (v: string) => void;
  price: string;
  onPriceChange: (v: string) => void;
  onExport: () => void;
}

export function FilterBar(props: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Sort toggle */}
      <div className="inline-flex rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => props.onSortChange("gmv")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            props.sort === "gmv"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          GMV High → Low
        </button>
        <button
          onClick={() => props.onSortChange("viral")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            props.sort === "viral"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Viral Score
        </button>
      </div>

      <Select value={props.category} onValueChange={props.onCategoryChange}>
        <SelectTrigger className="w-[150px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Tops">Tops</SelectItem>
          <SelectItem value="Bottoms">Bottoms</SelectItem>
          <SelectItem value="Dresses">Dresses</SelectItem>
          <SelectItem value="Footwear">Footwear</SelectItem>
          <SelectItem value="Accessories">Accessories</SelectItem>
          <SelectItem value="Outerwear">Outerwear</SelectItem>
          <SelectItem value="Swimwear">Swimwear</SelectItem>
        </SelectContent>
      </Select>

      <Select value={props.period} onValueChange={props.onPeriodChange}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="14d">Last 14 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
        </SelectContent>
      </Select>

      <Select value={props.price} onValueChange={props.onPriceChange}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All prices</SelectItem>
          <SelectItem value="under30">Under $30</SelectItem>
          <SelectItem value="30to80">$30 – $80</SelectItem>
          <SelectItem value="above80">Above $80</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={props.onExport} className="ml-auto text-xs">
        <Download className="h-3.5 w-3.5 mr-1" />
        Export CSV
      </Button>
    </div>
  );
}
