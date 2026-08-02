import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  positive: "bg-accent/15 text-accent",
  negative: "bg-danger/15 text-danger",
  neutral: "bg-slate-400/15 text-slate-500 dark:text-slate-300",
  admin: "bg-primary/15 text-primary",
  employee: "bg-secondary/15 text-secondary",
  customer: "bg-warning/15 text-warning",
};

export function Badge({ tone, children }: { tone: keyof typeof styles | string; children: ReactNode }) {
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium font-heading capitalize", styles[tone] || styles.neutral)}>
      {children}
    </span>
  );
}
