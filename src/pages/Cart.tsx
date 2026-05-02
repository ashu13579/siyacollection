import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const shipping = totalPrice >= 999 ? 0 : 79;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-28 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-4xl font-display font-semibold mb-3">Your cart is empty!</h2>
            <p className="text-muted-foreground font-semibold mb-8">
              Looks like you haven't added any toys yet 🧸
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-toy text-lg"
            >
              <ShoppingBag size={20} /> Start Shopping
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/products" className="p-2.5 rounded-2xl bg-muted hover:bg-muted/80 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold">Shopping Cart</h1>
            <p className="text-muted-foreground font-semibold text-sm">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="flex gap-4 bg-card p-4 rounded-3xl border-2 border-border hover:border-secondary transition-colors shadow-card"
                >
                  <Link to={`/product/${item.product.id}`} className="shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-border"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`} className="font-display font-semibold text-foreground hover:text-primary truncate block text-base">
                      {item.product.name}
                    </Link>
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.variants).map(([k, v]) => (
                          <span key={k} className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{k}: {v}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xl font-display font-semibold mt-1.5">₹{item.product.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex items-center border-2 border-border rounded-2xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-2.5 hover:bg-muted transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-sm font-bold border-x-2 border-border">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-2.5 hover:bg-muted transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="font-display font-semibold text-lg hidden sm:block shrink-0">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="h-fit sticky top-24 space-y-4">
            <div className="bg-card p-6 rounded-3xl border-2 border-border shadow-card">
              <h3 className="text-2xl font-display font-semibold mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-bold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={shipping === 0 ? "text-green-600 font-bold" : "font-bold"}>
                    {shipping === 0 ? "🎉 FREE" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="bg-secondary/20 rounded-2xl p-3 text-xs font-bold text-center">
                    Add ₹{(999 - totalPrice).toLocaleString()} more for <span className="text-primary">FREE delivery!</span>
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between text-xl pt-1">
                  <span className="font-display font-semibold">Total</span>
                  <span className="font-display font-semibold">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 w-full bg-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all text-lg shadow-toy hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Proceed to Checkout →
              </Link>
              <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground font-semibold">
                <div className="flex items-center gap-2"><ShieldCheck size={13} className="text-primary" /> Secure checkout via Razorpay</div>
                <div className="flex items-center gap-2"><Truck size={13} className="text-primary" /> Free delivery on orders ₹999+</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Cart;
