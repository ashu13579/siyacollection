import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useDbProducts, useDbCategories, dbToProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import SafeImage from "./SafeImage";
import { ShoppingCart, Heart, Star, ArrowRight, Flag } from "lucide-react";
import { toast } from "sonner";

// Individual product card — dark racing theme with red accents
const MajoretteCard = ({ product }: { product: ReturnType<typeof dbToProduct> }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.id}`} className="block group">
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#E8002D]/20 hover:border-[#E8002D]/60 hover:shadow-[0_8px_32px_rgba(232,0,45,0.18)] transition-all duration-300 shadow-card">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
            <SafeImage src={product.images[0]} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" loading="lazy" />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-[#E8002D] text-white text-[11px] font-black px-3 py-1 rounded-full">
                {discount}% OFF
              </span>
            )}
            {product.badge && (
              <span className="absolute top-3 right-10 bg-foreground text-white text-[11px] font-black px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); toast.success(wishlisted ? "Removed" : "Added to wishlist! ❤️"); }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm ${wishlisted ? "bg-[#E8002D] text-white" : "bg-white/90 text-muted-foreground hover:text-[#E8002D]"}`}>
              <Heart size={15} className={wishlisted ? "fill-white" : ""} />
            </button>
            {/* Quick add on hover */}
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); toast.success(`${product.name} added! 🚗`); }}
                className="w-full bg-[#E8002D] text-white font-bold py-3 text-sm flex items-center justify-center gap-2 hover:bg-[#C00025] transition-colors">
                <ShoppingCart size={15} /> Quick Add
              </button>
            </div>
          </div>
          {/* Info */}
          <div className="p-4">
            <h3 className="font-display font-semibold text-foreground truncate text-sm">{product.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Star size={12} className="fill-[#FFD600] text-[#FFD600]" />
              <span className="text-xs font-bold">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-display font-semibold">₹{product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); toast.success(`Added! 🚗`); }}
                className="w-9 h-9 rounded-2xl bg-[#E8002D] text-white flex items-center justify-center hover:bg-[#C00025] hover:scale-110 transition-all shadow-md">
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Sub-category definitions for Majorette
const MAJORETTE_SUBCATS = [
  { id: "all",        label: "All",            emoji: "🚗" },
  { id: "street",     label: "Street Cars",    emoji: "🏎️" },
  { id: "suv",        label: "SUV & 4x4",      emoji: "🚙" },
  { id: "muscle",     label: "Muscle Cars",    emoji: "💪" },
  { id: "truck",      label: "Trucks",         emoji: "🚛" },
  { id: "limited",    label: "Limited Edition", emoji: "🏆" },
];

// ── Main Majorette section ───────────────────────────────────────────────────
const Majorette = () => {
  const { data: dbProducts = [], isLoading } = useDbProducts();
  const { data: dbCategories = [] } = useDbCategories();
  const [activeSubcat, setActiveSubcat] = useState("all");

  const products = dbProducts.map((p) => dbToProduct(p, dbCategories));
  const allMajoretteProducts = products.filter((p) =>
    p.category?.toLowerCase().includes("majorette")
  );

  // Filter by sub-category tag when not "all"
  const majoretteProducts = (
    activeSubcat === "all"
      ? allMajoretteProducts
      : allMajoretteProducts.filter((p) =>
          p.name?.toLowerCase().includes(activeSubcat) ||
          (p.tags as string[] | undefined)?.some((t) =>
            t.toLowerCase().includes(activeSubcat)
          )
        )
  ).slice(0, 6);

  // Don't render if no Majorette products (won't clutter the page)
  if (!isLoading && allMajoretteProducts.length === 0) return null;

  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      {/* Subtle red-tinted bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF0F3] pointer-events-none" />
      {/* Decorative diagonal stripe */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#E8002D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E8002D]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10"
        >
          <div>
            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 bg-[#E8002D] text-white font-black text-xs px-4 py-1.5 rounded-full mb-4 shadow-md">
              <Flag size={12} className="fill-white" /> Official Collection · Made in France 🇫🇷
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-semibold leading-tight">
              <span className="text-[#E8002D]">Majorette</span>{" "}
              <span className="text-foreground">Die-Cast</span>
            </h2>
            <p className="text-muted-foreground font-semibold mt-2 text-sm">
              Premium 1:64 scale vehicles · Collector editions · Gift sets
            </p>
            {/* Racing stripe decoration */}
            <div className="flex gap-1 mt-4">
              <div className="h-1.5 w-10 bg-[#E8002D] rounded-full" />
              <div className="h-1.5 w-5 bg-[#FFD600] rounded-full" />
              <div className="h-1.5 w-20 bg-foreground/10 rounded-full" />
            </div>
          </div>
          <Link
            to="/products?category=majorette"
            className="inline-flex items-center gap-2 bg-[#E8002D] text-white font-bold px-6 py-3 rounded-2xl hover:bg-[#C00025] transition-all hover:scale-105 shadow-md text-sm whitespace-nowrap"
          >
            Shop All Majorette <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { icon: "🇫🇷", label: "Made in France", sub: "Since 1961" },
            { icon: "🔩", label: "Die-Cast Metal", sub: "Premium quality" },
            { icon: "📏", label: "1:64 Scale",       sub: "True-to-life" },
            { icon: "🏆", label: "Collector Series", sub: "Limited editions" },
          ].map((f) => (
            <motion.div key={f.label}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-2xl border-2 border-[#E8002D]/15 p-4 flex items-center gap-3 shadow-card hover:border-[#E8002D]/40 transition-colors">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-bold text-sm text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground font-semibold">{f.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sub-category filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {MAJORETTE_SUBCATS.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveSubcat(cat.id)}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 border-2 ${
                activeSubcat === cat.id
                  ? "bg-[#E8002D] text-white border-[#E8002D] shadow-md"
                  : "bg-white text-foreground border-border hover:border-[#E8002D]/50 hover:text-[#E8002D]"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl aspect-square animate-pulse border-2 border-[#E8002D]/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {majoretteProducts.map((p) => <MajoretteCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#E8002D] to-[#FF6B35] rounded-3xl p-6 md:p-8"
        >
          <div>
            <p className="text-white font-display font-semibold text-xl">🏁 Start Your Collection Today!</p>
            <p className="text-white/75 text-sm font-semibold mt-1">500+ Majorette models available · Free delivery on ₹999+</p>
          </div>
          <Link to="/products?category=majorette"
            className="shrink-0 bg-white text-[#E8002D] font-bold px-7 py-3 rounded-2xl hover:scale-105 transition-all shadow-md text-sm">
            Explore Collection →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Majorette;
