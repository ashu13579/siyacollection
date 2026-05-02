import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, Grid3X3, Image, ShoppingCart, TrendingUp, Users, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardStats {
  products: number; categories: number; banners: number; orders: number;
  totalRevenue: number; pendingOrders: number; deliveredOrders: number; totalCustomers: number;
}
interface RecentOrder { id: string; total: number; status: string; created_at: string; items: any[]; }
interface RawOrder { id: string; total: number | string; status: string; created_at: string; items: any[]; }

const statusColor: Record<string, string> = {
  pending: "bg-secondary/20 text-secondary-foreground",
  processing: "bg-toy-orange/15 text-toy-orange",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-toy-green/15 text-toy-green",
  cancelled: "bg-destructive/10 text-destructive",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "revenue" ? `₹${Number(p.value).toLocaleString()}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    products: 0, categories: 0, banners: 0, orders: 0,
    totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0, totalCustomers: 0,
  });
  const [allOrders, setAllOrders] = useState<RawOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartRange, setChartRange] = useState<7 | 30>(30);

  useEffect(() => {
    const fetchStats = async () => {
      const [p, c, b, o, profiles] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("banners").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("*"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const orders = (o.data || []) as RawOrder[];
      const nonCancelled = orders.filter(o => o.status !== "cancelled");
      setAllOrders(orders);
      setStats({
        products: p.count ?? 0, categories: c.count ?? 0, banners: b.count ?? 0,
        orders: orders.length,
        totalRevenue: nonCancelled.reduce((s, o) => s + Number(o.total), 0),
        pendingOrders: orders.filter(o => o.status === "pending" || o.status === "processing").length,
        deliveredOrders: orders.filter(o => o.status === "delivered").length,
        totalCustomers: profiles.count ?? 0,
      });
      setRecentOrders([...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10) as RecentOrder[]);
    };
    fetchStats();
  }, []);

  // Build chart data: daily revenue + order count for last N days
  const chartData = useMemo(() => {
    const days = chartRange;
    const result: { date: string; revenue: number; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const dayKey = d.toISOString().split("T")[0];
      const dayOrders = allOrders.filter(o => {
        const od = new Date(o.created_at).toISOString().split("T")[0];
        return od === dayKey && o.status !== "cancelled";
      });
      result.push({ date: label, revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0), orders: dayOrders.length });
    }
    return result;
  }, [allOrders, chartRange]);

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "bg-primary/10 text-primary", path: "/admin/orders" },
    { label: "Orders", value: stats.orders, icon: ShoppingCart, color: "bg-secondary/20 text-secondary-foreground", path: "/admin/orders" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: TrendingUp, color: "bg-toy-orange/15 text-toy-orange", path: "/admin/orders" },
    { label: "Delivered", value: stats.deliveredOrders, icon: Package, color: "bg-toy-green/15 text-toy-green", path: "/admin/orders" },
    { label: "Products", value: stats.products, icon: Package, color: "bg-accent/10 text-accent", path: "/admin/products" },
    { label: "Categories", value: stats.categories, icon: Grid3X3, color: "bg-toy-purple/15 text-toy-purple", path: "/admin/categories" },
    { label: "Customers", value: stats.totalCustomers, icon: Users, color: "bg-primary/10 text-primary", path: "/admin/customers" },
    { label: "Hero Banners", value: stats.banners, icon: Image, color: "bg-secondary/20 text-secondary-foreground", path: "/admin/banners" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <Link key={card.label} to={card.path}>
            <div className="bg-card rounded-2xl p-5 border border-border shadow-card cursor-pointer hover:scale-[1.03] hover:shadow-lg transition-all duration-200">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} mb-3`}>
                <card.icon size={20} />
              </div>
              <p className="text-2xl font-black">{card.value}</p>
              <p className="text-muted-foreground text-sm font-semibold">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black">Sales Overview</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Revenue and orders over time</p>
          </div>
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {([7, 30] as const).map(r => (
              <button key={r} onClick={() => setChartRange(r)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${chartRange === r ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {r}d
              </button>
            ))}
          </div>
        </div>

        {allOrders.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center"><p className="text-4xl mb-2">📊</p><p className="font-semibold">No orders yet</p></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false} axisLine={false}
                interval={chartRange === 30 ? 4 : 0} />
              <YAxis yAxisId="revenue" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false} axisLine={false}
                tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="revenue"
                stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
              <Area yAxisId="orders" type="monotone" dataKey="orders" name="orders"
                stroke="hsl(var(--secondary))" strokeWidth={2} fill="url(#ordersGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary font-bold hover:underline">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Order ID","Items","Total","Status","Date"].map(h => (
                    <th key={h} className="pb-3 font-bold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono text-xs">{order.id.slice(0,8).toUpperCase()}</td>
                    <td className="py-3">{Array.isArray(order.items) ? order.items.length : 0} items</td>
                    <td className="py-3 font-bold">₹{Number(order.total).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[order.status] || "bg-muted"}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
