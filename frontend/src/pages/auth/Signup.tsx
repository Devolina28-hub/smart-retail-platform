import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

interface FormValues {
  name: string;
  email: string;
  password: string;
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await signup(values.name, values.email, values.password);
      navigate("/dashboard");
    } catch {
      setError("Could not create account — that email may already be registered.");
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

        <h2 className="font-heading text-2xl font-semibold mb-1">Create your account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Start managing your store intelligently</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                {...register("name", { required: true })}
              />
            </div>
            {errors.name && <p className="text-xs text-danger mt-1">Name is required</p>}
          </div>

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
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 focus:ring-2 focus:ring-primary outline-none text-sm"
                {...register("password", { required: true, minLength: 6 })}
              />
            </div>
            {errors.password && <p className="text-xs text-danger mt-1">Minimum 6 characters</p>}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <UserPlus className="h-4 w-4" /> {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
