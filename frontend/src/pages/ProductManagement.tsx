import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Boxes, X } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";

interface Product {
  product_id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
}

export default function ProductManagement() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("name", name);
      form.append("category", category);
      form.append("price", price);
      form.append("stock", stock || "0");
      if (image) form.append("image", image);
      return api.post("/products", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      setName(""); setCategory(""); setPrice(""); setStock(""); setImage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  return (
    <DashboardLayout title="Product Management">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-semibold">New Product</h3>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-lg">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary" />
                <input placeholder="Category (e.g. Shoes)" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary" />
                <input placeholder="Price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary" />
                <input placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div
                onClick={() => fileInput.current?.click()}
                className="mt-4 border-2 border-dashed border-primary/30 rounded-3xl h-28 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <p className="text-sm text-slate-500">{image ? image.name : "Click to upload product image (optional)"}</p>
              </div>
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              <Button
                className="w-full mt-4"
                onClick={() => createMutation.mutate()}
                disabled={!name || !category || !price || createMutation.isPending}
              >
                {createMutation.isPending ? "Saving…" : "Save Product"}
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(products || []).map((p, i) => (
            <motion.div key={p.product_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-heading font-semibold">{p.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{p.category}</p>
                  </div>
                  <button onClick={() => deleteMutation.mutate(p.product_id)} className="p-2 rounded-xl hover:bg-danger/10 text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex justify-between items-end pt-4">
                  <p className="font-mono text-xl font-semibold text-primary">{formatCurrency(p.price)}</p>
                  <p className="text-xs text-slate-500">Stock: <span className="font-mono">{p.stock}</span></p>
                </div>
              </Card>
            </motion.div>
          ))}
          {(products || []).length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <Boxes className="h-10 w-10 mx-auto mb-2" />
              <p>No products yet — add your first one above.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
