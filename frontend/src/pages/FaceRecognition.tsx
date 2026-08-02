import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Upload, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

interface RecognitionResult {
  matched: boolean;
  confidence: number;
  message: string;
  customer?: { name: string; customer_id: number };
}

export default function FaceRecognition() {
  const [mode, setMode] = useState<"recognize" | "register">("recognize");

  // Recognize state
  const [recognizeFile, setRecognizeFile] = useState<File | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [recognizing, setRecognizing] = useState(false);

  // Register state
  const [registerFile, setRegisterFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);

  const recognizeInput = useRef<HTMLInputElement>(null);
  const registerInput = useRef<HTMLInputElement>(null);

  async function handleRecognize() {
    if (!recognizeFile) return;
    setRecognizing(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", recognizeFile);
      const { data } = await api.post("/face/recognize", form);
      setResult(data);
    } catch {
      setResult({ matched: false, confidence: 0, message: "Recognition failed — try another photo." });
    } finally {
      setRecognizing(false);
    }
  }

  async function handleRegister() {
    if (!registerFile || !name) return;
    setRegistering(true);
    setRegisterMessage(null);
    try {
      const form = new FormData();
      form.append("image", registerFile);
      form.append("name", name);
      if (phone) form.append("phone", phone);
      await api.post("/face/register", form);
      setRegisterMessage(`Registered ${name} successfully.`);
      setName("");
      setPhone("");
      setRegisterFile(null);
    } catch (err: any) {
      setRegisterMessage(err.response?.data?.detail || "Registration failed — make sure a face is clearly visible.");
    } finally {
      setRegistering(false);
    }
  }

  return (
    <DashboardLayout title="Face Recognition">
      <div className="flex gap-2">
        {(["recognize", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-2xl text-sm font-heading font-medium transition-colors ${
              mode === m ? "bg-gradient-brand text-white shadow-glow" : "bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-300"
            }`}
          >
            {m === "recognize" ? "Recognize Customer" : "Register Customer"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "recognize" ? (
          <motion.div key="recognize" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <ScanFace className="h-5 w-5 text-primary" /> Upload or capture a photo
              </h3>
              <div
                onClick={() => recognizeInput.current?.click()}
                className="border-2 border-dashed border-primary/30 rounded-3xl h-56 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <Upload className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-slate-500">{recognizeFile ? recognizeFile.name : "Click to upload a face photo"}</p>
              </div>
              <input
                ref={recognizeInput}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => setRecognizeFile(e.target.files?.[0] || null)}
              />
              <Button className="w-full mt-4" onClick={handleRecognize} disabled={!recognizeFile || recognizing}>
                {recognizing ? "Recognizing…" : "Recognize Customer"}
              </Button>
            </Card>

            <Card>
              <h3 className="font-heading font-semibold mb-4">Result</h3>
              {!result && <p className="text-sm text-slate-400">Upload a photo to see the recognition result here.</p>}
              {result && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                  <div className={`flex items-center gap-2 ${result.matched ? "text-accent" : "text-danger"}`}>
                    {result.matched ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                    <p className="font-heading font-semibold">{result.message}</p>
                  </div>
                  {result.customer && <p className="text-sm">Customer: <span className="font-medium">{result.customer.name}</span></p>}
                  <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-brand"
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence * 100}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-mono">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="max-w-xl">
              <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" /> Register a new customer
              </h3>
              <div className="space-y-4">
                <input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <div
                  onClick={() => registerInput.current?.click()}
                  className="border-2 border-dashed border-primary/30 rounded-3xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
                >
                  <Upload className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm text-slate-500">{registerFile ? registerFile.name : "Upload a clear face photo"}</p>
                </div>
                <input
                  ref={registerInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setRegisterFile(e.target.files?.[0] || null)}
                />
                <Button className="w-full" onClick={handleRegister} disabled={!registerFile || !name || registering}>
                  {registering ? "Registering…" : "Register Customer"}
                </Button>
                {registerMessage && <p className="text-sm text-center text-slate-600 dark:text-slate-300">{registerMessage}</p>}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
