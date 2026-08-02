import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

interface FormValues {
  email: string;
  password: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch {
      setError("Incorrect email or password.");
    }
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
          <div>
            <p className="font-heading font-bold text-lg leading-tight">Smart Retail</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Intelligence Platform</p>
          </div>
        </div>

        <h2 className="font-heading text-2xl font-semibold mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sign in to your dashboard</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                {...register("email", { required: true })}
              />
            </div>
            {errors.email && <p className="text-xs text-danger mt-1">Email is required</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                {...register("password", { required: true })}
              />
            </div>
            {errors.password && <p className="text-xs text-danger mt-1">Password is required</p>}
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <LogIn className="h-4 w-4" /> {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>

        <p className="text-[11px] text-center text-slate-400 mt-4">
          Demo admin: admin@smartretail.dev / Admin@123 (after running the seed script)
        </p>
      </motion.div>
    </div>
  );
}
