import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  items: any[];
  shipping_address: any;
  awb_number?: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-secondary/20 text-secondary-foreground",
  processing: "bg-toy-orange/15 text-toy-orange",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-toy-green/15 text-toy-green",
  cancelled: "bg-destructive/10 text-destructive",
};

const Orders = () => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data || []) as Order[]);
        setFetching(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-7xl mb-4">🔒</p>
          <h2 className="text-2xl font-black mb-2">Please sign in to view your orders</h2>
          <Link to="/auth" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:opacity-90 mt-4">
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-black mb-8 flex items-center gap-3">
          <Package size={32} /> My Orders
        </h1>

        {fetching ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-7xl mb-4">📦</p>
            <h2 className="text-2xl font-black mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't placed any orders!</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:opacity-90">
              <ShoppingBag size={20} /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-card rounded-2xl border border-border shadow-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xl font-black mt-0.5">₹{Number(order.total).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[order.status] || "bg-muted"}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-3">
                  {Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                      <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping address */}
                {order.shipping_address && (
                  <div className="text-xs text-muted-foreground border-t border-border pt-3 mt-3">
                    <span className="font-semibold text-foreground">Delivering to: </span>
                    {order.shipping_address.name}, {order.shipping_address.address}, {order.shipping_address.city} — {order.shipping_address.pincode}
                  </div>
                )}
                {/* Tracking */}
                {order.awb_number && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-xs font-semibold text-foreground">Tracking:</span>
                    <span className="text-xs font-mono text-muted-foreground">{order.awb_number}</span>
                    <a href={`https://www.delhivery.com/track/package/${order.awb_number}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary font-bold hover:underline ml-auto">Track Order →</a>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  <span>Payment: <span className="font-semibold text-foreground capitalize">{order.payment_method}</span></span>
                  <span>•</span>
                  <span>Status: <span className="font-semibold text-foreground capitalize">{order.payment_status}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Orders;
