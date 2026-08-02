import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-gradient-brand text-white shadow-glow",
  secondary: "bg-accent text-white",
  ghost: "bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300/60 dark:border-white/15",
  danger: "bg-danger text-white",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 font-heading font-medium text-sm transition-shadow disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
