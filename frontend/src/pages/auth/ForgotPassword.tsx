import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, KeyRound } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface FormValues {
  email: string;
}

export default function ForgotPassword() {
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setMessage(null);
    const { data } = await api.post("/auth/forgot-password", values);
    setMessage(data.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surfaceLight to-slate-100 dark:from-surfaceDark dark:to-[#0B1220] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-panel rounded-3xl shadow-soft p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <p className="font-heading font-bold text-lg">Smart Retail</p>
        </div>

        <h2 className="font-heading text-2xl font-semibold mb-1">Reset your password</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Enter your account email and we'll generate a reset token.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
              {...register("email", { required: true })}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <KeyRound className="h-4 w-4" /> {isSubmitting ? "Sending…" : "Send reset token"}
          </Button>
        </form>

        {message && <p className="text-sm text-accent mt-4">{message}</p>}

        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-6">
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
