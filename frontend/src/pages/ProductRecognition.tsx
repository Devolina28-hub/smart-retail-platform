import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PackageSearch, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

interface Prediction {
  category: string;
  confidence: number;
}

interface ClassificationResult {
  top_prediction: Prediction;
  top_k: Prediction[];
}

export default function ProductRecognition() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    setFile(f);
    setResult(null);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleClassify() {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/classify", form);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Product Recognition">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-primary" /> Upload a product photo
          </h3>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-primary/30 rounded-3xl h-56 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover rounded-3xl" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-slate-500">Click to upload a product image</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <Button className="w-full mt-4" onClick={handleClassify} disabled={!file || loading}>
            {loading ? "Analyzing…" : "Detect Category"}
          </Button>
        </Card>

        <Card>
          <h3 className="font-heading font-semibold mb-4">Top Predictions</h3>
          {!result && <p className="text-sm text-slate-400">Upload an image to see category predictions.</p>}
          {result && (
            <div className="space-y-4">
              {result.top_k.map((p, i) => (
                <motion.div key={p.category} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{p.category}</span>
                    <span className="font-mono text-slate-500">{(p.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.confidence * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    />
                  </div>
                </motion.div>
              ))}
              {result.top_prediction.category === "unknown" && (
                <p className="text-xs text-warning">
                  No trained classifier found yet — run <code className="font-mono">ml/train_product_classifier.py</code> with your product images to enable real predictions.
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
