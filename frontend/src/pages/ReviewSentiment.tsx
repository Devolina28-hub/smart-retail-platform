import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, Upload, Smile, Frown, Meh } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";

interface SentimentResult {
  sentiment: string;
  confidence: number;
  scores: Record<string, number>;
}

const sentimentIcon: Record<string, any> = { positive: Smile, negative: Frown, neutral: Meh };

export default function ReviewSentiment() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [csvSummary, setCsvSummary] = useState<{ total: number; positive: number; negative: number; neutral: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function analyzeText() {
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const { data } = await api.post("/sentiment", { text });
      setResult(data);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCsv(file: File) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post("/reviews/upload-csv", form);
    setCsvSummary(data);
  }

  const Icon = result ? sentimentIcon[result.sentiment] || Meh : null;

  return (
    <DashboardLayout title="Review Sentiment">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" /> Analyze a single review
          </h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Type or paste a customer review…"
            className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <Button className="w-full mt-4" onClick={analyzeText} disabled={!text.trim() || analyzing}>
            {analyzing ? "Analyzing…" : "Analyze Sentiment"}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                {Icon && <Icon className="h-8 w-8 text-primary" />}
                <Badge tone={result.sentiment}>{result.sentiment}</Badge>
                <span className="font-mono text-sm text-slate-500">{(result.confidence * 100).toFixed(1)}% confident</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {Object.entries(result.scores).map(([k, v]) => (
                  <div key={k} className="glass-panel rounded-2xl py-2">
                    <p className="capitalize text-slate-500">{k}</p>
                    <p className="font-mono font-semibold">{(v * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </Card>

        <Card>
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Bulk analyze via CSV
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Columns expected: <span className="font-mono text-xs">customer_id, product_id, review, rating</span>
          </p>
          <div
            onClick={() => fileInput.current?.click()}
            className="border-2 border-dashed border-primary/30 rounded-3xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
          >
            <Upload className="h-6 w-6 text-primary mb-2" />
            <p className="text-sm text-slate-500">Click to upload reviews.csv</p>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])}
          />

          {csvSummary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-4 gap-2 mt-6 text-center">
              <div className="glass-panel rounded-2xl py-3">
                <p className="text-xs text-slate-500">Total</p>
                <p className="font-mono font-semibold">{csvSummary.total}</p>
              </div>
              <div className="glass-panel rounded-2xl py-3">
                <p className="text-xs text-accent">Positive</p>
                <p className="font-mono font-semibold">{csvSummary.positive}</p>
              </div>
              <div className="glass-panel rounded-2xl py-3">
                <p className="text-xs text-danger">Negative</p>
                <p className="font-mono font-semibold">{csvSummary.negative}</p>
              </div>
              <div className="glass-panel rounded-2xl py-3">
                <p className="text-xs text-slate-500">Neutral</p>
                <p className="font-mono font-semibold">{csvSummary.neutral}</p>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
