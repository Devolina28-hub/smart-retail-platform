import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/Card";

interface Slice {
  label: string;
  value: number;
}

const COLORS = ["#10B981", "#EF4444", "#94A3B8", "#2563EB", "#F59E0B"];

export function PieChartCard({ title, data }: { title: string; data: Slice[] }) {
  return (
    <Card>
      <h3 className="font-heading font-semibold text-slate-800 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={3} animationDuration={900}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 16, border: "none" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
