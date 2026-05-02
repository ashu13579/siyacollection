import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window { Razorpay: any; }
}

interface ShippingAddress {
  name: string; phone: string; email: string;
  address: string; city: string; state: string; pincode: string;
}
interface Coupon {
  id: string; code: string; discount_type: "percentage" | "fixed";
  discount_value: number; min_order_amount: number;
  is_active: boolean; expires_at: string | null;
}

const emptyAddress: ShippingAddress = { name:"",phone:"",email:"",address:"",city:"",state:"",pincode:"" };

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"address"|"payment"|"success">("address");
  const [addr, setAddr] = useState<ShippingAddress>(emptyAddress);
  const [pincodeStatus, setPincodeStatus] = useState<"idle"|"checking"|"ok"|"fail">("idle");
  const [deliveryDays, setDeliveryDays] = useState("3-5");
  const [paymentMethod, setPaymentMethod] = useState<"online"|"cod">("online");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string|null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string|null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const shipping = totalPrice >= 999 ? 0 : 79;
  const codCharge = paymentMethod === "cod" ? 40 : 0;
  const finalTotal = Math.max(totalPrice + shipping + codCharge - discount, 0);

  // Load Razorpay SDK dynamically
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Auth + cart guard — must be in useEffect, not render phase
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { state: { from: "/checkout" } });
    } else if (items.length === 0 && step !== "success") {
      navigate("/cart");
    }
  }, [loading, user, items.length, step, navigate]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-primary"/>
    </div>
  );
  if (items.length === 0 && step !== "success") return null;

  // ── Pincode check ─────────────────────────────────────────────────────────
  const checkPincode = async (pin: string) => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) return;
    setPincodeStatus("checking");
    try {
      const { data, error } = await supabase.functions.invoke("check-pincode", { body: { pincode: pin } });
      if (error) { setPincodeStatus("ok"); setDeliveryDays("3-5"); return; }
      if (data?.serviceable === false) {
        setPincodeStatus("fail");
        toast.error("Sorry, delivery is not available at this pincode.");
      } else {
        setPincodeStatus("ok");
        setDeliveryDays(data?.estimated_days || "3-5");
        if (data?.city) setAddr(a => ({ ...a, city: data.city }));
        if (data?.state) setAddr(a => ({ ...a, state: data.state }));
        toast.success(`Delivery available! Expected in ${data?.estimated_days || "3-5"} days.`);
      }
    } catch { setPincodeStatus("ok"); setDeliveryDays("3-5"); }
  };

  const handlePincodeChange = (val: string) => {
    setAddr(a => ({ ...a, pincode: val }));
    setPincodeStatus("idle");
    if (val.length === 6) checkPincode(val);
  };

  // ── Address validation ────────────────────────────────────────────────────
  const validateAddress = () => {
    const fields: (keyof ShippingAddress)[] = ["name","phone","email","address","city","state","pincode"];
    for (const f of fields) {
      if (!addr[f].trim()) { toast.error(`Please fill in your ${f}`); return false; }
    }
    if (!/^\d{10}$/.test(addr.phone)) { toast.error("Enter a valid 10-digit phone number"); return false; }
    if (!/\S+@\S+\.\S+/.test(addr.email)) { toast.error("Enter a valid email address"); return false; }
    if (addr.pincode.length !== 6) { toast.error("Enter a valid 6-digit pincode"); return false; }
    if (pincodeStatus === "fail") { toast.error("Delivery not available at this pincode"); return false; }
    return true;
  };

  // ── Coupon ────────────────────────────────────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode) { toast.error("Enter a coupon code"); return; }
    setCouponLoading(true);
    const { data, error } = await supabase.from("coupons").select("*")
      .eq("code", couponCode.trim().toUpperCase()).eq("is_active", true).single();
    if (error || !data) { toast.error("Invalid coupon code"); setCouponLoading(false); return; }
    const coupon = data as unknown as Coupon;
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) { toast.error("Coupon expired"); setCouponLoading(false); return; }
    if (totalPrice < coupon.min_order_amount) { toast.error(`Minimum order ₹${coupon.min_order_amount} required`); setCouponLoading(false); return; }
    const calc = coupon.discount_type === "percentage" ? (totalPrice * coupon.discount_value) / 100 : coupon.discount_value;
    setDiscount(calc); setAppliedCoupon(coupon.code); toast.success("Coupon applied!"); setCouponLoading(false);
  };

  // ── COD order ─────────────────────────────────────────────────────────────
  const placeCodOrder = async () => {
    setProcessing(true);
    const orderItems = items.map(i => ({
      product_id: i.product.id, name: i.product.name, price: i.product.price,
      quantity: i.quantity, image: i.product.images[0] || "",
    }));
    const { data: orderData, error } = await supabase.from("orders").insert({
      user_id: user.id, items: orderItems as any, subtotal: totalPrice,
      shipping, total: finalTotal, shipping_address: addr as any,
      payment_method: "cod", payment_status: "pending", status: "pending",
    }).select("id").single();
    if (error) { toast.error(error.message); setProcessing(false); return; }
    setOrderId(orderData.id);
    // Fire-and-forget: notification + Delhivery shipment (don't block UI)
    supabase.functions.invoke("notify-order", { body: { order_id: orderData.id } }).catch(() => {});
    supabase.functions.invoke("create-delhivery-shipment", { body: { order_id: orderData.id } }).catch(() => {});
    clearCart(); setStep("success"); setProcessing(false);
  };

  // ── Razorpay online payment ────────────────────────────────────────────────
  const placeOnlineOrder = async () => {
    setProcessing(true);
    try {
      const orderItems = items.map(i => ({
        product_id: i.product.id, name: i.product.name, price: i.product.price,
        quantity: i.quantity, image: i.product.images[0] || "",
        variants: i.variants || null,
      }));

      // Call edge function to create Razorpay order + pending DB record
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: finalTotal, items: orderItems,
          shipping_address: addr, shipping, user_id: user.id,
        },
      });

      if (error || data?.error) {
        // Razorpay not configured → fall back to saving as COD-style pending
        toast.error(data?.error || "Payment gateway not configured. Please use Cash on Delivery.");
        setProcessing(false);
        return;
      }

      const { order_id, amount, razorpay_key_id, db_order_id } = data;

      if (!window.Razorpay) {
        toast.error("Razorpay failed to load. Please refresh and try again.");
        setProcessing(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: razorpay_key_id,
        amount,
        currency: "INR",
        name: "Siya Collection",
        description: "Toy Order",
        order_id,
        prefill: { name: addr.name, email: addr.email, contact: addr.phone },
        theme: { color: "#0ea5e9" },
        handler: async (response: any) => {
          // Verify payment via edge function
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              db_order_id,
            },
          });
          if (verifyError || !verifyData?.success) {
            toast.error("Payment verification failed. Contact support with your payment ID: " + response.razorpay_payment_id);
          } else {
            setOrderId(db_order_id);
            // Fire-and-forget: notification + Delhivery shipment
            supabase.functions.invoke("notify-order", { body: { order_id: db_order_id } }).catch(() => {});
            supabase.functions.invoke("create-delhivery-shipment", { body: { order_id: db_order_id } }).catch(() => {});
            clearCart();
            setStep("success");
            toast.success("Payment successful! 🎉");
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled.");
            setProcessing(false);
          },
        },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "cod") placeCodOrder();
    else placeOnlineOrder();
  };

  // ── Order Summary ─────────────────────────────────────────────────────────
  const OrderSummary = () => (
    <div className="bg-card p-5 rounded-2xl border border-border">
      <h3 className="font-black mb-3 text-lg">Order Summary</h3>
      <div className="space-y-1.5 mb-3">
        {items.map(i => (
          <div key={i.product.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground truncate max-w-[160px]">{i.product.name} × {i.quantity}</span>
            <span className="font-semibold">₹{(i.product.price * i.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <hr className="border-border mb-3"/>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totalPrice.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping===0?"text-primary font-semibold":""}>{shipping===0?"FREE":`₹${shipping}`}</span></div>
        {paymentMethod==="cod" && <div className="flex justify-between"><span className="text-muted-foreground">COD Charge</span><span>₹{codCharge}</span></div>}
        {appliedCoupon && <div className="flex justify-between text-green-600 font-semibold"><span>Coupon ({appliedCoupon})</span><span>− ₹{discount.toLocaleString()}</span></div>}
        <hr className="border-border"/>
        <div className="flex justify-between font-black text-lg"><span>Total</span><span>₹{finalTotal.toLocaleString()}</span></div>
      </div>
      {step==="payment" && pincodeStatus==="ok" && <p className="mt-3 text-xs text-primary font-semibold">🚚 Est. delivery: {deliveryDays} business days</p>}
      {shipping===0 && <p className="mt-2 text-xs text-primary font-medium">✓ Free shipping on orders above ₹999</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header/>
      <main className="container py-8 max-w-4xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/cart" className="hover:text-foreground transition-colors">← Cart</Link>
          <span>/</span>
          <span className={step==="address"?"text-foreground font-semibold":""}>Address</span>
          <span>/</span>
          <span className={step==="payment"?"text-foreground font-semibold":""}>Payment</span>
        </div>

        <AnimatePresence mode="wait">

          {/* ADDRESS STEP */}
          {step==="address" && (
            <motion.div key="address" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border">
                  <h2 className="text-xl font-black mb-5 flex items-center gap-2"><MapPin size={20} className="text-primary"/> Delivery Address</h2>
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold mb-1 block">Full Name *</label>
                        <input value={addr.name} onChange={e=>setAddr({...addr,name:e.target.value})} placeholder="Rahul Sharma" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-1 block">Phone Number *</label>
                        <input value={addr.phone} onChange={e=>setAddr({...addr,phone:e.target.value})} placeholder="10-digit mobile" maxLength={10} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1 block">Email Address *</label>
                      <input type="email" value={addr.email} onChange={e=>setAddr({...addr,email:e.target.value})} placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1 block">House / Flat / Street *</label>
                      <textarea value={addr.address} onChange={e=>setAddr({...addr,address:e.target.value})} placeholder="House no., building, street, area…" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"/>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-bold mb-1 block">Pincode *</label>
                        <div className="relative">
                          <input value={addr.pincode} onChange={e=>handlePincodeChange(e.target.value)} placeholder="6-digit" maxLength={6}
                            className={`w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary pr-8 ${pincodeStatus==="ok"?"border-green-500":pincodeStatus==="fail"?"border-destructive":"border-border"}`}/>
                          {pincodeStatus==="checking" && <Loader2 size={14} className="absolute right-3 top-3.5 animate-spin text-muted-foreground"/>}
                          {pincodeStatus==="ok" && <CheckCircle2 size={14} className="absolute right-3 top-3.5 text-green-500"/>}
                        </div>
                        {pincodeStatus==="ok" && <p className="text-xs text-green-600 mt-1 font-medium">✓ Available ({deliveryDays} days)</p>}
                        {pincodeStatus==="fail" && <p className="text-xs text-destructive mt-1 font-medium">✗ Not serviceable</p>}
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-1 block">City *</label>
                        <input value={addr.city} onChange={e=>setAddr({...addr,city:e.target.value})} placeholder="Mumbai" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-1 block">State *</label>
                        <select value={addr.state} onChange={e=>setAddr({...addr,state:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="">Select state</option>
                          {indianStates.map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>{if(validateAddress())setStep("payment");}} className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                    Continue to Payment <ArrowRight size={18}/>
                  </button>
                </div>
                <OrderSummary/>
              </div>
            </motion.div>
          )}

          {/* PAYMENT STEP */}
          {step==="payment" && (
            <motion.div key="payment" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-5">
                  {/* Address summary */}
                  <div className="bg-card p-5 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold flex items-center gap-2"><MapPin size={16} className="text-primary"/> Delivering to</h3>
                      <button onClick={()=>setStep("address")} className="text-xs text-primary font-bold hover:underline">Change</button>
                    </div>
                    <p className="text-sm font-semibold">{addr.name} — {addr.phone}</p>
                    <p className="text-sm text-muted-foreground">{addr.address}, {addr.city}, {addr.state} — {addr.pincode}</p>
                    {pincodeStatus==="ok" && <p className="text-xs text-primary font-medium mt-1">🚚 Expected in {deliveryDays} business days</p>}
                  </div>

                  {/* Payment */}
                  <div className="bg-card p-6 rounded-2xl border border-border">
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2"><CreditCard size={20} className="text-primary"/> Payment Method</h2>
                    <div className="space-y-3">
                      {(["online","cod"] as const).map(m=>(
                        <div key={m} onClick={()=>setPaymentMethod(m)} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod===m?"border-primary bg-primary/5":"border-border hover:border-primary/40"}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod===m?"border-primary":"border-muted-foreground"}`}>
                            {paymentMethod===m && <div className="w-2 h-2 rounded-full bg-primary"/>}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{m==="online"?"Pay Online":"Cash on Delivery"}{m==="cod"&&<span className="text-muted-foreground font-normal"> (+₹40)</span>}</p>
                            <p className="text-xs text-muted-foreground">{m==="online"?"UPI, Cards, Net Banking via Razorpay — secure & instant":"Pay when your order arrives at your door"}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coupon */}
                    <div className="mt-5">
                      <label className="text-sm font-bold mb-2 block">Have a coupon?</label>
                      <div className="flex gap-2">
                        <input value={couponCode} onChange={e=>setCouponCode(e.target.value)} placeholder="Enter coupon code" disabled={!!appliedCoupon}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 uppercase"/>
                        {appliedCoupon
                          ? <button onClick={()=>{setAppliedCoupon(null);setDiscount(0);setCouponCode("");}} className="px-4 py-2.5 bg-destructive/10 text-destructive rounded-xl font-bold text-sm">Remove</button>
                          : <button onClick={applyCoupon} disabled={couponLoading} className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-bold text-sm disabled:opacity-60">{couponLoading?<Loader2 size={16} className="animate-spin"/>:"Apply"}</button>
                        }
                      </div>
                    </div>

                    <button onClick={handlePlaceOrder} disabled={processing} className="w-full mt-6 bg-gradient-to-r from-toy-orange to-secondary text-secondary-foreground font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-60 text-lg">
                      {processing
                        ? <><Loader2 size={20} className="animate-spin"/>Processing…</>
                        : paymentMethod==="online"
                          ? `Pay ₹${finalTotal.toLocaleString()} Online →`
                          : `Place Order — ₹${finalTotal.toLocaleString()}`
                      }
                    </button>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      {paymentMethod==="online" ? "🔒 Secured by Razorpay. We never store your card details." : ""}
                      {" "}By placing your order you agree to our <a href="/terms" className="underline">Terms</a>.
                    </p>
                  </div>
                </div>
                <OrderSummary/>
              </div>
            </motion.div>
          )}

          {/* SUCCESS STEP */}
          {step==="success" && (
            <motion.div key="success" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center py-16">
              <CheckCircle2 size={80} className="mx-auto mb-5 text-primary"/>
              <h2 className="text-4xl font-black mb-2">Order Placed! 🎉</h2>
              <p className="text-muted-foreground mb-2">Thank you, {addr.name}! Your order is confirmed.</p>
              {orderId && <p className="text-sm font-mono text-muted-foreground mb-1">Order ID: <span className="text-foreground font-bold">{orderId.slice(0,8).toUpperCase()}</span></p>}
              <p className="text-sm text-muted-foreground mb-8">Confirmation sent to <span className="font-semibold">{addr.email}</span></p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/orders" className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all">View My Orders</Link>
                <Link to="/products" className="bg-muted font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all">Continue Shopping</Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      <Footer/>
      <WhatsAppButton/>
    </div>
  );
};

export default Checkout;
