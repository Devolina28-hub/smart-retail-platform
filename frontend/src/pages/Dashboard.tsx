import { useQuery } from "@tanstack/react-query";
import { Users, ScanFace, Boxes, MessageSquareText, ThumbsUp, ThumbsDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { PieChartCard } from "@/components/charts/PieChartCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";

interface Summary {
  total_customers: number;
  recognized_today: number;
  total_products: number;
  total_reviews: number;
  positive_reviews: number;
  negative_reviews: number;
  neutral_reviews: number;
}

export default function Dashboard() {
  const { data: summary, isLoading } = useQuery<Summary>({
    queryKey: ["analytics-summary"],
    queryFn: async () => (await api.get("/analytics/summary")).data,
  });

  const { data: timeline } = useQuery({
    queryKey: ["visits-timeline"],
    queryFn: async () => (await api.get("/analytics/visits-timeline")).data,
  });

  const { data: categories } = useQuery({
    queryKey: ["top-categories"],
    queryFn: async () => (await api.get("/analytics/top-categories")).data,
  });

  const { data: reviewBreakdown } = useQuery({
    queryKey: ["review-breakdown"],
    queryFn: async () => (await api.get("/analytics/review-breakdown")).data,
  });

  return (
    <DashboardLayout title="Dashboard">
      {isLoading || !summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Customers" value={summary.total_customers} icon={Users} accent="primary" />
          <StatCard label="Recognized Today" value={summary.recognized_today} icon={ScanFace} accent="secondary" />
          <StatCard label="Products" value={summary.total_products} icon={Boxes} accent="accent" />
          <StatCard label="Reviews" value={summary.total_reviews} icon={MessageSquareText} accent="warning" />
          <StatCard label="Positive Reviews" value={summary.positive_reviews} icon={ThumbsUp} accent="accent" />
          <StatCard label="Negative Reviews" value={summary.negative_reviews} icon={ThumbsDown} accent="danger" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LineChartCard
            title="Customer Visits (Last 7 Days)"
            data={(timeline || []).map((t: any) => ({ label: t.label, value: t.value }))}
          />
        </div>
        <PieChartCard
          title="Review Sentiment Breakdown"
          data={(reviewBreakdown || []).map((r: any) => ({ label: r.label, value: r.value }))}
        />
      </div>

      <BarChartCard
        title="Top Product Categories"
        data={(categories || []).map((c: any) => ({ label: c.category, value: c.count }))}
        color="#10B981"
      />
    </DashboardLayout>
  );
}
