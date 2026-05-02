import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Heart, Star, Truck, Shield, ArrowLeft, CheckCircle2, Loader2, Share2 } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import { useDbProducts, useDbCategories, dbToProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import RecentlyViewed from "@/components/RecentlyViewed";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "checking" | "ok" | "fail">("idle");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const { data: dbProducts = [], isLoading } = useDbProducts();
  const { data: dbCategories = [] } = useDbCategories();

  const products = dbProducts.map((p) => dbToProduct(p, dbCategories));
  const product = products.find((p) => p.id === id);

  const { addItem: recordView } = useRecentlyViewed();
  if (product) { try { recordView(product); } catch {} }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 flex justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-28 text-center">
          <div className="text-7xl mb-4">😕</div>
          <h2 className="text-3xl font-display font-semibold mb-3">Product not found</h2>
          <Link to="/products" className="text-primary font-bold underline">← Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const images = product.images.length > 0 ? product.images : ["/placeholder.svg"];
  const wishlisted = isWishlisted(product.id);

  const handleAdd = () => {
    const variantData = Object.keys(selectedVariants).length ? selectedVariants : undefined;
    for (let i = 0; i < qty; i++) addToCart(product, variantData);
    toast.success(`${qty}× ${product.name} added to cart! 🎉`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${product.name} at Siya Collection! ₹${product.price.toLocaleString()}`;
    if (navigator.share) { try { await navigator.share({ title: product.name, text, url }); } catch {} }
    else window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  };

  const checkPincode = async () => {
    if (pincode.length !== 6 || !/^\d+$/.test(pincode)) { toast.error("Enter a valid 6-digit pincode"); return; }
    setPincodeStatus("checking");
    try {
      const { data, error } = await supabase.functions.invoke("check-pincode", { body: { pincode } });
      if (error || !data || data?.serviceable !== false) { setPincodeStatus("ok"); setDeliveryDays(data?.estimated_days || "3-5"); }
      else { setPincodeStatus("fail"); }
    } catch { setPincodeStatus("ok"); setDeliveryDays("3-5"); }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={product.name} description={product.description || undefined} image={product.images[0]} url={`/product/${product.id}`} />
      <Header />
      <main className="container py-8 md:py-12">

        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm font-bold transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 md:gap-14">

          {/* Gallery */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-muted rounded-3xl overflow-hidden aspect-square relative border-2 border-border">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
              {product.badge && (
                <span className="absolute top-4 left-4 bg-accent text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 bg-foreground text-background text-xs font-black px-3 py-1.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-18 h-18 w-[72px] h-[72px] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-primary shadow-toy" : "border-border hover:border-primary/50"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {product.badge && (
              <span className="inline-block bg-accent/15 text-accent font-bold text-xs px-3 py-1.5 rounded-full mb-3">
                {product.badge}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-semibold">{product.name}</h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={17} className={i < Math.round(product.rating) ? "fill-secondary text-secondary" : "fill-muted text-muted"} />
                ))}
              </div>
              <span className="font-bold text-sm">{product.rating}</span>
              <span className="text-muted-foreground text-sm font-semibold">({product.reviews} reviews)</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-display font-semibold">₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{discount}% OFF</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Inclusive of all taxes</p>

            {product.description && (
              <p className="mt-5 text-muted-foreground leading-relaxed font-semibold text-sm">{product.description}</p>
            )}

            {/* Variants */}
            {product.variants?.map((v: any) => (
              <div key={v.label} className="mt-5">
                <p className="font-bold text-sm mb-2">
                  {v.label}
                  {selectedVariants[v.label] && <span className="ml-2 text-primary font-semibold">— {selectedVariants[v.label]}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {v.options.map((opt: string) => (
                    <button key={opt} onClick={() => setSelectedVariants(prev => ({ ...prev, [v.label]: opt }))}
                      className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all ${
                        selectedVariants[v.label] === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center border-2 border-border rounded-2xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 font-bold hover:bg-muted transition-colors text-lg">−</button>
                <span className="px-5 py-3 font-bold border-x-2 border-border min-w-[52px] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-3 font-bold hover:bg-muted transition-colors text-lg">+</button>
              </div>
              <button onClick={handleAdd} disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] disabled:opacity-50 shadow-toy text-base">
                <ShoppingCart size={19} /> {product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                onClick={() => { toggleWishlist(product); toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist! ❤️"); }}
                className={`p-4 rounded-2xl border-2 transition-all ${wishlisted ? "bg-accent/10 border-accent text-accent" : "border-border hover:bg-accent/10 hover:border-accent"}`}
                aria-label="Wishlist">
                <Heart size={20} className={wishlisted ? "fill-accent" : ""} />
              </button>
              <button onClick={handleShare} className="p-4 rounded-2xl border-2 border-border hover:bg-muted transition-colors" aria-label="Share">
                <Share2 size={20} />
              </button>
            </div>

            {/* Pincode check */}
            <div className="mt-6 p-5 bg-muted/50 rounded-2xl border-2 border-border">
              <p className="text-sm font-bold mb-3 flex items-center gap-2"><Truck size={16} className="text-primary" /> Check Delivery</p>
              <div className="flex gap-2">
                <input
                  type="text" value={pincode}
                  onChange={(e) => { setPincode(e.target.value); setPincodeStatus("idle"); }}
                  onKeyDown={(e) => e.key === "Enter" && checkPincode()}
                  placeholder="Enter 6-digit pincode" maxLength={6}
                  className={`flex-1 px-4 py-2.5 rounded-2xl border-2 bg-card text-sm focus:outline-none font-semibold transition-colors ${
                    pincodeStatus === "ok" ? "border-green-500" : pincodeStatus === "fail" ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                <button onClick={checkPincode} disabled={pincodeStatus === "checking"}
                  className="px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5">
                  {pincodeStatus === "checking" ? <Loader2 size={14} className="animate-spin" /> : "Check"}
                </button>
              </div>
              {pincodeStatus === "ok" && (
                <p className="text-sm text-green-600 font-bold mt-2.5 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Delivery in {deliveryDays} business days
                </p>
              )}
              {pincodeStatus === "fail" && (
                <p className="text-sm text-destructive font-bold mt-2.5">✗ Delivery not available here</p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground font-bold">
              <span className="flex items-center gap-1.5"><Shield size={13} className="text-primary" /> 100% Genuine</span>
              <span className="flex items-center gap-1.5"><Truck size={13} className="text-primary" /> Free delivery ₹999+</span>
              <span>↩️ 7-day easy returns</span>
            </div>
          </motion.div>
        </div>

        <ReviewSection productId={product.id} />

        {related.length > 0 && (
          <div className="mt-16 md:mt-20">
            <h2 className="text-3xl font-display font-semibold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
        <RecentlyViewed excludeId={product.id} />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ProductDetail;
