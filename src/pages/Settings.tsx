import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { triggerPipeline } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Play, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [triggering, setTriggering] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [runTime, setRunTime] = useState("6am");

  const toggleShow = (key: string) => setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      await triggerPipeline();
      toast({ title: "Pipeline triggered successfully", description: "Data will be available shortly." });
    } catch {
      toast({ title: "Failed to trigger pipeline", description: "Check API configuration.", variant: "destructive" });
    } finally {
      setTriggering(false);
    }
  };

  const apiKeys = [
    { id: "apify", label: "Apify Token", subtitle: "TikTok Shop scraper (apify.com)" },
    { id: "openai", label: "OpenAI API Key", subtitle: "Whisper transcription" },
    { id: "anthropic", label: "Anthropic API Key", subtitle: "Claude analysis" },
    { id: "alibaba", label: "Alibaba Cloud API Key", subtitle: "Qwen analysis (alternative to Claude)" },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-[600px] mx-auto">
        <h1 className="text-xl font-bold text-foreground-strong mb-1">API Configuration</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Configure your data source and AI API keys. Stored securely in environment.
        </p>

        <div className="space-y-5 mb-8">
          {apiKeys.map((key) => (
            <div key={key.id}>
              <Label htmlFor={key.id} className="text-sm font-medium text-foreground-strong">{key.label}</Label>
              {key.subtitle && <p className="text-xs text-muted-foreground mb-1">{key.subtitle}</p>}
              <div className="relative mt-1">
                <Input
                  id={key.id}
                  type={showKeys[key.id] ? "text" : "password"}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(key.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground-strong"
                >
                  {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground-strong mb-4">Pipeline Control</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-foreground-strong">Auto-run daily pipeline</div>
              <div className="text-xs text-muted-foreground">Automatically fetch and analyze new videos</div>
            </div>
            <Switch checked={autoRun} onCheckedChange={setAutoRun} />
          </div>

          <div className="mb-4">
            <Label className="text-sm text-foreground-strong">Pipeline run time</Label>
            <Select value={runTime} onValueChange={setRunTime}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4am">4:00 AM EST</SelectItem>
                <SelectItem value="5am">5:00 AM EST</SelectItem>
                <SelectItem value="6am">6:00 AM EST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="w-full text-teal border-teal hover:bg-teal-light"
            onClick={handleTrigger}
            disabled={triggering}
          >
            <Play className="h-4 w-4 mr-2" />
            {triggering ? "Triggering..." : "Run Pipeline Now"}
          </Button>
        </div>

        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Save Settings
        </Button>
      </div>
    </Layout>
  );
}
