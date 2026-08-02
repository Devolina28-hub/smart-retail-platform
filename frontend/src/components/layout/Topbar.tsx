import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/utils";

export function Topbar({ title }: { title: string }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 glass-panel border-b border-white/40 dark:border-white/10 px-6 py-4 flex items-center justify-between">
      <h1 className="font-heading font-semibold text-xl text-slate-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-10 w-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </motion.button>

        <button
          aria-label="Notifications"
          className="h-10 w-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 transition-colors relative"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-300/50 dark:border-white/10">
          <div className="h-9 w-9 rounded-full bg-gradient-brand text-white flex items-center justify-center text-xs font-heading font-semibold">
            {user ? initials(user.name) : "?"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button onClick={logout} aria-label="Log out" className="ml-2 p-2 rounded-xl hover:bg-danger/10 text-danger">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
