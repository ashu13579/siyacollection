import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Package, Truck } from "lucide-react";
import SafeImage from "@/components/SafeImage";

interface Order {
  id: string; user_id: string; items: any[];
  subtotal: number; shipping: number; total: number;
  status: string; payment_method: string; payment_status: string;
  shipping_address: any; awb_number?: string;
  created_at: string;
}

const statusOptions = ["pending","processing","shipped","delivered","cancelled"];
const statusColor: Record<string,string> = {
  pending: "bg-secondary/20 text-secondary-foreground",
  processing: "bg-toy-orange/15 text-toy-orange",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-toy-green/15 text-toy-green",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string|null>(null);
  const [awbInputs, setAwbInputs] = useState<Record<string,string>>({});
  const [savingAwb, setSavingAwb] = useState<string|null>(null);
  const [creatingShipment, setCreatingShipment] = useState<string|null>(null);

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error) {
      const orders = (data || []) as Order[];
      setOrders(orders);
      // Pre-fill AWB inputs with existing values
      const awbs: Record<string,string> = {};
      orders.forEach(o => { if (o.awb_number) awbs[o.id] = o.awb_number; });
      setAwbInputs(awbs);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(`Status updated to ${status}`);
    fetchOrders();
  };

  const saveAwb = async (id: string) => {
    const awb = awbInputs[id]?.trim();
    if (!awb) { toast.error("Enter a tracking number"); return; }
    setSavingAwb(id);
    const { error } = await supabase.from("orders").update({ awb_number: awb }).eq("id", id);
    setSavingAwb(null);
    if (error) { toast.error("Failed to save AWB"); return; }
    toast.success("Tracking number saved ✅");
    fetchOrders();
  };

  const createDelhiveryShipment = async (id: string) => {
    setCreatingShipment(id);
    const { data, error } = await supabase.functions.invoke("create-delhivery-shipment", {
      body: { order_id: id },
    });
    setCreatingShipment(null);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Failed to create shipment");
      return;
    }
    toast.success(`Shipment created! AWB: ${data.awb_number} 🚚`);
    fetchOrders();
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const totalRevenue = orders.filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} total · Revenue: ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-4 py-2 text-sm font-semibold">
          <option value="all">All Orders</option>
          {statusOptions.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20"><p className="text-5xl mb-4">📦</p><p className="text-xl font-bold">No orders found</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const addr = order.shipping_address || {};
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                {/* Order header */}
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(0,8).toUpperCase()}</p>
                      <p className="font-black text-xl mt-0.5">₹{Number(order.total).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {new Date(order.created_at).toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[order.status]||"bg-muted"}`}>
                          {order.status.charAt(0).toUpperCase()+order.status.slice(1)}
                        </span>
                        <select value={order.status} onChange={e=>updateStatus(order.id, e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold">
                          {statusOptions.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{order.payment_method}</span>
                        <span>·</span>
                        <span className={order.payment_status==="paid"?"text-green-600 font-semibold":"text-toy-orange font-semibold"}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer info always visible */}
                  {addr.name && (
                    <div className="mt-3 p-3 bg-muted/40 rounded-xl text-sm">
                      <p className="font-semibold">{addr.name} · {addr.phone}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{addr.address}, {addr.city}, {addr.state} — {addr.pincode}</p>
                      {addr.email && <p className="text-muted-foreground text-xs">{addr.email}</p>}
                    </div>
                  )}

                  {/* AWB / Tracking number */}
                  <div className="mt-3 flex items-center gap-2">
                    <Truck size={14} className="text-muted-foreground shrink-0"/>
                    <input
                      value={awbInputs[order.id] || ""}
                      onChange={e=>setAwbInputs({...awbInputs,[order.id]:e.target.value})}
                      placeholder="Enter AWB / tracking number"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button onClick={()=>saveAwb(order.id)} disabled={savingAwb===order.id}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-60 flex items-center gap-1">
                      {savingAwb===order.id ? "Saving…" : "Save"}
                    </button>
                    {/* Auto-create shipment via Delhivery API */}
                    {!order.awb_number && (
                      <button
                        onClick={() => createDelhiveryShipment(order.id)}
                        disabled={creatingShipment === order.id}
                        title="Auto-create shipment on Delhivery"
                        className="px-3 py-1.5 bg-toy-orange text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-60 flex items-center gap-1 whitespace-nowrap"
                      >
                        <Truck size={12}/>
                        {creatingShipment === order.id ? "Creating…" : "Auto-Ship"}
                      </button>
                    )}
                  </div>
                  {order.awb_number && (
                    <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                      <Package size={12}/> Tracking: {order.awb_number}
                      <a
                        href={`https://www.delhivery.com/track/package/${order.awb_number}`}
                        target="_blank" rel="noopener noreferrer"
                        className="ml-2 underline hover:no-underline"
                      >
                        Track →
                      </a>
                    </p>
                  )}

                  {/* Expand toggle */}
                  <button onClick={()=>setExpanded(isOpen?null:order.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-semibold">
                    {isOpen ? <><ChevronUp size={14}/> Hide items</> : <><ChevronDown size={14}/> View {Array.isArray(order.items)?order.items.length:0} items</>}
                  </button>
                </div>

                {/* Expanded items */}
                {isOpen && (
                  <div className="border-t border-border bg-muted/30 px-5 py-4">
                    <div className="space-y-2">
                      {Array.isArray(order.items) && order.items.map((item:any, i:number) => (
                        <div key={i} className="flex items-center gap-3">
                          <SafeImage src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-border"/>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString()}</p>
                          </div>
                          <p className="text-sm font-bold">₹{(item.price*item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground flex flex-wrap gap-4">
                      <span>Subtotal: ₹{Number(order.subtotal).toLocaleString()}</span>
                      <span>Shipping: {Number(order.shipping)===0?"FREE":"₹"+Number(order.shipping)}</span>
                      <span className="font-bold text-foreground">Total: ₹{Number(order.total).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
