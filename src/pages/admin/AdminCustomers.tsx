import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShoppingBag, TrendingUp } from "lucide-react";

interface Customer {
  id: string; email: string; display_name: string | null; created_at: string;
  orderCount: number; totalSpent: number; lastOrderDate: string | null;
}

const AdminCustomers = () => {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("id, email, display_name, created_at").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total, created_at").neq("status", "cancelled"),
      ]);
      const profiles = profilesRes.data || [];
      const orders = ordersRes.data || [];

      return profiles.map(p => {
        const userOrders = orders.filter(o => o.user_id === p.id);
        const totalSpent = userOrders.reduce((s, o) => s + Number(o.total), 0);
        const sorted = userOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return {
          ...p,
          orderCount: userOrders.length,
          totalSpent,
          lastOrderDate: sorted[0]?.created_at || null,
        } as Customer;
      }).sort((a, b) => b.totalSpent - a.totalSpent);
    },
  });

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const activeCustomers = customers.filter(c => c.orderCount > 0).length;

  return (
    <div>
      <h1 className="text-3xl font-black mb-2">Customers</h1>
      <p className="text-sm text-muted-foreground mb-6">{customers.length} registered · {activeCustomers} have ordered</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Customers", value: customers.length, icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Customers with Orders", value: activeCustomers, icon: ShoppingBag, color: "bg-secondary/20 text-secondary-foreground" },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-toy-green/15 text-toy-green" },
        ].map(card => (
          <div key={card.label} className="bg-card rounded-2xl p-5 border border-border shadow-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} mb-3`}>
              <card.icon size={20}/>
            </div>
            <p className="text-2xl font-black">{card.value}</p>
            <p className="text-muted-foreground text-sm font-semibold">{card.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/></div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-bold">Customer</th>
                <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-bold">Orders</th>
                <th className="text-left px-4 py-3 font-bold">Total Spent</th>
                <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{c.display_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(c.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.orderCount > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {c.orderCount} order{c.orderCount !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {c.totalSpent > 0 ? `₹${c.totalSpent.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No customers yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
