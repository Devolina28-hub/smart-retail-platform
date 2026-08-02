import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShieldCheck, Trash2, Database, Cpu, Brain } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee" | "customer";
}

interface SystemStatus {
  database: string;
  face_model: string;
  product_model: string;
  sentiment_model: string;
}

export default function AdminPanel() {
  const queryClient = useQueryClient();

  const { data: users } = useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get("/admin/users")).data,
  });

  const { data: status } = useQuery<SystemStatus>({
    queryKey: ["admin-status"],
    queryFn: async () => (await api.get("/admin/status")).data,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => api.put(`/admin/users/${id}/role?role=${role}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <DashboardLayout title="Admin Panel">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <Database className="h-6 w-6 text-primary" />
          <div>
            <p className="text-xs text-slate-500">Database</p>
            <p className="font-heading font-medium capitalize">{status?.database || "checking…"}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Cpu className="h-6 w-6 text-secondary" />
          <div>
            <p className="text-xs text-slate-500">Product Classifier</p>
            <p className="font-heading font-medium">{status?.product_model || "checking…"}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-accent" />
          <div>
            <p className="text-xs text-slate-500">Sentiment Model</p>
            <p className="font-heading font-medium">{status?.sentiment_model || "checking…"}</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Manage Users & Permissions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-white/10">
                <th className="py-3 pr-4 font-heading font-medium">Name</th>
                <th className="py-3 pr-4 font-heading font-medium">Email</th>
                <th className="py-3 pr-4 font-heading font-medium">Role</th>
                <th className="py-3 font-heading font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-100 dark:border-white/5 hover:bg-primary/5"
                >
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={u.role}
                      onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                      className="bg-transparent border border-slate-300/50 dark:border-white/10 rounded-xl px-2 py-1 text-xs"
                    >
                      <option value="admin">admin</option>
                      <option value="employee">employee</option>
                      <option value="customer">customer</option>
                    </select>
                    <Badge tone={u.role}>{u.role}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => deleteMutation.mutate(u.id)} className="p-2 rounded-xl hover:bg-danger/10 text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
