import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/Card";

interface Point {
  label: string;
  value: number;
}

export function BarChartCard({ title, data, color = "#06B6D4" }: { title: string; data: Point[]; color?: string }) {
  return (
    <Card>
      <h3 className="font-heading font-semibold text-slate-800 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/10" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="currentColor" opacity={0.5} />
          <YAxis tick={{ fontSize: 12 }} stroke="currentColor" opacity={0.5} />
          <Tooltip
            contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 40px -10px rgba(15,23,42,0.25)" }}
          />
          <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
