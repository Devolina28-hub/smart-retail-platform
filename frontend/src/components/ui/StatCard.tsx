import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: "primary" | "secondary" | "accent" | "warning" | "danger";
  suffix?: string;
}

const accentBg: Record<string, string> = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  accent: "bg-accent/15 text-accent",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

/** Animated counter: eases from 0 to `value` on mount/update. */
function useAnimatedCounter(target: number, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let frame: number;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

export function StatCard({ label, value, icon: Icon, accent = "primary", suffix = "" }: StatCardProps) {
  const animated = useAnimatedCounter(value);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-panel rounded-3xl shadow-soft p-5 flex items-center gap-4"
    >
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", accentBg[accent])}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-heading">{label}</p>
        <p className="font-mono text-2xl font-semibold text-slate-900 dark:text-white">
          {animated.toLocaleString()}
          {suffix}
        </p>
      </div>
    </motion.div>
  );
}
