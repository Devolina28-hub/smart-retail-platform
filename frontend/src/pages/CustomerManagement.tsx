import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Download, Trash2, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";

interface Customer {
  customer_id: number;
  name: string;
  phone?: string;
  email?: string;
  gender?: string;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function CustomerManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers", search, page],
    queryFn: async () =>
      (await api.get("/customers", { params: { search: search || undefined, page, page_size: PAGE_SIZE } })).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  async function exportCsv() {
    const res = await api.get("/customers/export.csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    link.click();
  }

  return (
    <DashboardLayout title="Customer Management">
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, phone…"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-white/10">
                  <th className="py-3 pr-4 font-heading font-medium">Name</th>
                  <th className="py-3 pr-4 font-heading font-medium">Phone</th>
                  <th className="py-3 pr-4 font-heading font-medium">Email</th>
                  <th className="py-3 pr-4 font-heading font-medium">Gender</th>
                  <th className="py-3 pr-4 font-heading font-medium">Joined</th>
                  <th className="py-3 font-heading font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(customers || []).map((c, i) => (
                  <motion.tr
                    key={c.customer_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-primary/5"
                  >
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4 text-slate-500">{c.phone || "—"}</td>
                    <td className="py-3 pr-4 text-slate-500">{c.email || "—"}</td>
                    <td className="py-3 pr-4 text-slate-500 capitalize">{c.gender || "—"}</td>
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteMutation.mutate(c.customer_id)}
                        className="p-2 rounded-xl hover:bg-danger/10 text-danger"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {(customers || []).length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Users className="h-10 w-10 mx-auto mb-2" />
                <p>No customers found.</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <Button variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={(customers || []).length < PAGE_SIZE}>
            Next
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  );
}
