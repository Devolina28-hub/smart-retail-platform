import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ScanFace, PackageSearch, MessageSquareText,
  Users, Boxes, BarChart3, ShieldCheck, Sparkles, MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/face-recognition", label: "Face Recognition", icon: ScanFace },
  { to: "/product-recognition", label: "Product Recognition", icon: PackageSearch },
  { to: "/review-sentiment", label: "Review Sentiment", icon: MessageSquareText },
  { to: "/chatbot", label: "FAQ Chatbot", icon: MessagesSquare },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 glass-panel border-r border-white/40 dark:border-white/10 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-heading font-bold text-slate-900 dark:text-white leading-tight">Smart Retail</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">Intelligence Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "text-slate-600 dark:text-slate-300 hover:bg-primary/10"
                )}
              >
                <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                {label}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="text-[11px] text-slate-400 px-2 pt-4 border-t border-white/20 dark:border-white/10">
        v1.0.0 · Free-stack build
      </div>
    </aside>
  );
}
