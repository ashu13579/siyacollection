import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useWishlist } from "@/contexts/WishlistContext";
import SafeImage from "@/components/SafeImage";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    removeFromWishlist(product.id);
    toast.success(`${product.name} moved to cart! 🛒`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-28 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="text-8xl mb-6">🤍</div>
            <h2 className="text-4xl font-display font-semibold mb-3">Your wishlist is empty!</h2>
            <p className="text-muted-foreground font-semibold mb-8">Save toys you love and come back to them later</p>
            <Link to="/products"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-toy text-base">
              Browse Products <ArrowRight size={18} />
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
      <div className="bg-foreground py-10 md:py-14">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-background flex items-center gap-3">
            <Heart size={36} className="fill-accent text-accent" /> My Wishlist
          </h1>
          <p className="text-background/50 font-semibold mt-2">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <main className="container py-10 max-w-4xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {items.map((product, i) => {
              const discount = product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;
              return (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-3xl border-2 border-border hover:border-secondary shadow-card overflow-hidden flex gap-4 p-4 transition-colors">
                  <Link to={`/product/${product.id}`} className="shrink-0">
                    <SafeImage src={product.images[0]} alt={product.name}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-border" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.id}`}
                      className="font-display font-semibold text-foreground hover:text-primary block truncate transition-colors">
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xl font-display font-semibold">₹{product.price.toLocaleString()}</span>
                      {discount > 0 && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{discount}% OFF</span>
                        </>
                      )}
                    </div>
                    {!product.inStock && <p className="text-xs text-destructive font-bold mt-1">Out of Stock</p>}
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => handleMoveToCart(product)} disabled={!product.inStock}
                        className="flex items-center gap-1.5 bg-primary text-white text-sm font-bold px-4 py-2 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all hover:scale-105">
                        <ShoppingCart size={15} /> Move to Cart
                      </button>
                      <button onClick={() => { removeFromWishlist(product.id); toast.success("Removed from wishlist"); }}
                        className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Wishlist;
