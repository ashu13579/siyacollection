import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Tag, ToggleLeft, ToggleRight } from "lucide-react";

interface Coupon {
  id: string; code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number; min_order_amount: number;
  is_active: boolean; expires_at: string | null;
}

const emptyForm = { code: "", discount_type: "percentage" as const, discount_value: 0, min_order_amount: 0, expires_at: "" };

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.code.trim()) throw new Error("Coupon code required");
      if (editingCoupon) {
        return supabase.from("coupons").update({ ...form, expires_at: form.expires_at || null }).eq("id", editingCoupon.id);
      }
      return supabase.from("coupons").insert({ ...form, code: form.code.trim().toUpperCase(), is_active: true, expires_at: form.expires_at || null });
    },
    onSuccess: () => {
      toast.success(editingCoupon ? "Coupon updated ✅" : "Coupon created 🎉");
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setShowForm(false); setEditingCoupon(null); setForm(emptyForm);
    },
    onError: (e: any) => toast.error(e.message || "Something went wrong"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      return supabase.from("coupons").update({ is_active }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => supabase.from("coupons").delete().eq("id", id),
    onSuccess: () => { toast.success("Coupon deleted"); queryClient.invalidateQueries({ queryKey: ["coupons"] }); },
  });

  const handleEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: c.min_order_amount, expires_at: c.expires_at?.split("T")[0] || "" });
    setShowForm(true);
  };

  const resetForm = () => { setShowForm(false); setEditingCoupon(null); setForm(emptyForm); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">{coupons.filter(c => c.is_active).length} active coupon{coupons.filter(c=>c.is_active).length!==1?"s":""}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all">
          <Plus size={18}/> Add Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border mb-8 shadow-card">
          <h2 className="text-xl font-black mb-4">{editingCoupon ? "Edit Coupon" : "New Coupon"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold mb-1 block">Coupon Code *</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                placeholder="e.g. SIYA40" disabled={!!editingCoupon}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"/>
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Discount Type</label>
              <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value as any})}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Discount Value {form.discount_type === "percentage" ? "(%)" : "(₹)"}</label>
              <input type="number" min="0" value={form.discount_value} onChange={e => setForm({...form, discount_value: +e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Min Order Amount (₹)</label>
              <input type="number" min="0" value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: +e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Expires On <span className="font-normal text-muted-foreground">(optional)</span></label>
              <input type="date" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
              className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60">
              {editingCoupon ? "Update" : "Create"} Coupon
            </button>
            <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-border font-semibold hover:bg-muted transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Tag size={48} className="mx-auto mb-3 opacity-30"/>
          <p className="font-semibold">No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {coupons.map(c => {
            const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
            return (
              <div key={c.id} className={`bg-card rounded-2xl border shadow-card p-5 flex flex-wrap items-center gap-4 ${!c.is_active || isExpired ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                    <Tag size={18} className="text-primary"/>
                  </div>
                  <div className="min-w-0">
                    <p className="font-black font-mono tracking-wider">{c.code}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {c.discount_type === "percentage" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                      {" · "}Min ₹{c.min_order_amount}
                      {c.expires_at && ` · Expires ${new Date(c.expires_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExpired && <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-1 rounded-full">Expired</span>}
                  <button onClick={() => toggleMutation.mutate({ id: c.id, is_active: !c.is_active })}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    {c.is_active ? <ToggleRight size={22} className="text-primary"/> : <ToggleLeft size={22}/>}
                    {c.is_active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Pencil size={15}/></button>
                  <button onClick={() => { if (confirm("Delete this coupon?")) deleteMutation.mutate(c.id); }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={15}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
