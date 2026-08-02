import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-surfaceLight via-white to-slate-100 dark:from-surfaceDark dark:via-[#0B1220] dark:to-[#0F172A]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="p-6 space-y-6 max-w-[1600px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
