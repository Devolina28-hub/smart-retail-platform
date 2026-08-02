import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { PieChartCard } from "@/components/charts/PieChartCard";
import { StatCard } from "@/components/ui/StatCard";
import { TrendingUp, Users, Target, MessageSquareText } from "lucide-react";
import api from "@/lib/api";

export default function Analytics() {
  const { data: summary } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => (await api.get("/analytics/summary")).data,
  });

  const { data: timeline } = useQuery({
    queryKey: ["visits-timeline-30"],
    queryFn: async () => (await api.get("/analytics/visits-timeline", { params: { days: 30 } })).data,
  });

  const { data: categories } = useQuery({
    queryKey: ["top-categories"],
    queryFn: async () => (await api.get("/analytics/top-categories")).data,
  });

  const { data: reviewBreakdown } = useQuery({
    queryKey: ["review-breakdown"],
    queryFn: async () => (await api.get("/analytics/review-breakdown")).data,
  });

  const accuracyEstimate = summary
    ? Math.round((summary.positive_reviews / Math.max(1, summary.total_reviews)) * 100)
    : 0;

  return (
    <DashboardLayout title="Analytics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Visitors (30d)" value={(timeline || []).reduce((s: number, t: any) => s + t.value, 0)} icon={Users} accent="primary" />
        <StatCard label="Recognition Confidence" value={accuracyEstimate} suffix="%" icon={Target} accent="secondary" />
        <StatCard label="Total Reviews" value={summary?.total_reviews || 0} icon={MessageSquareText} accent="warning" />
        <StatCard label="Revenue (placeholder)" value={0} suffix=" — connect POS" icon={TrendingUp} accent="accent" />
      </div>

      <LineChartCard title="Visitor Trend (30 Days)" data={(timeline || []).map((t: any) => ({ label: t.label, value: t.value }))} />

      <div className="grid lg:grid-cols-2 gap-6">
        <BarChartCard title="Top Categories" data={(categories || []).map((c: any) => ({ label: c.category, value: c.count }))} color="#2563EB" />
        <PieChartCard title="Review Statistics" data={(reviewBreakdown || []).map((r: any) => ({ label: r.label, value: r.value }))} />
      </div>
    </DashboardLayout>
  );
}
