import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart, Zap } from "lucide-react";
import SafeImage from "./SafeImage";
import { useDbProducts, useDbCategories, dbToProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

// ── Individual Hot Wheels card with racing theme ──────────────────────────────
const HotWheelsCard = ({ product }: { product: ReturnType<typeof dbToProduct> }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart! 🏎️`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist(product);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist! ❤️");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.id}`} className="block group">
        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#ff2800]/30 hover:border-[#ff2800]/80 transition-all duration-300 shadow-lg hover:shadow-[0_0_24px_rgba(255,40,0,0.3)]">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-[#111]">
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            {/* Flame overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#ff2800]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {product.badge && (
              <span className="absolute top-3 left-3 bg-[#ff2800] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-3 right-3 bg-[#ffcc00] text-black text-xs font-black px-2 py-1 rounded-full">
                {discount}% OFF
              </span>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-[#1a1a1a] text-white font-bold px-4 py-2 rounded-lg border border-white/20">
                  Out of Stock
                </span>
              </div>
            )}
            <button
              onClick={handleWishlist}
              className={`absolute bottom-3 right-3 p-2 rounded-full shadow transition-all ${
                wishlisted
                  ? "bg-[#ff2800] text-white scale-110"
                  : "bg-black/60 backdrop-blur-sm text-white/60 hover:text-[#ff2800] hover:bg-black/80"
              }`}
              aria-label="Wishlist"
            >
              <Heart size={14} className={wishlisted ? "fill-white" : ""} />
            </button>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-bold text-white truncate text-sm">{product.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Star size={12} className="fill-[#ffcc00] text-[#ffcc00]" />
              <span className="text-xs font-semibold text-white/80">{product.rating}</span>
              <span className="text-xs text-white/40">({product.reviews})</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-base font-black text-white">₹{product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-white/40 line-through ml-2">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="bg-[#ff2800] text-white p-2.5 rounded-xl hover:bg-[#cc2000] transition-all hover:scale-105 disabled:opacity-50"
                aria-label="Add to cart"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ── Main Hot Wheels section ───────────────────────────────────────────────────
const HotWheels = () => {
  const { data: dbProducts = [], isLoading } = useDbProducts();
  const { data: dbCategories = [] } = useDbCategories();

  const products = dbProducts.map((p) => dbToProduct(p, dbCategories));
  const hotWheelsProducts = products
    .filter((p) => p.category === "hot-wheels")
    .slice(0, 6);

  // Only render if there are actual Hot Wheels products
  if (!isLoading && hotWheelsProducts.length === 0) return null;

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-[#0d0d0d]">

      {/* Background track lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Diagonal speed lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[#ff2800]/20 to-transparent"
            style={{
              top: `${10 + i * 12}%`,
              left: "-10%",
              right: "-10%",
              transform: `rotate(-3deg)`,
            }}
          />
        ))}
        {/* Glow blobs */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#ff2800]/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#ffcc00]/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container relative z-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Hot Wheels logo-style badge */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 bg-[#ff2800] text-white font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_12px_rgba(255,40,0,0.6)]">
                <Zap size={12} className="fill-white" /> Official Collection
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-none">
              <span
                className="text-transparent"
                style={{
                  WebkitTextStroke: "2px #ff2800",
                  textShadow: "0 0 30px rgba(255,40,0,0.5)",
                }}
              >
                HOT
              </span>{" "}
              <span className="text-[#ffcc00]" style={{ textShadow: "0 0 20px rgba(255,204,0,0.4)" }}>
                WHEELS
              </span>
            </h2>
            <p className="text-white/50 mt-2 text-sm font-medium">
              🏎️ Die-cast cars • Track sets • Limited editions
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/products?category=hot-wheels"
              className="inline-flex items-center gap-2 bg-[#ff2800] hover:bg-[#cc2000] text-white font-black px-6 py-3 rounded-full transition-all hover:scale-105 shadow-[0_4px_16px_rgba(255,40,0,0.4)] text-sm uppercase tracking-wide"
            >
              <Zap size={16} className="fill-white" />
              Shop All Hot Wheels
            </Link>
          </motion.div>
        </div>

        {/* Divider: racing stripe */}
        <div className="flex gap-1 mb-10">
          <div className="h-2 w-8 bg-[#ff2800] rounded-full" />
          <div className="h-2 w-4 bg-[#ffcc00] rounded-full" />
          <div className="h-2 flex-1 bg-white/10 rounded-full" />
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-2xl aspect-square animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {hotWheelsProducts.map((product) => (
              <HotWheelsCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1a1a1a] border border-[#ff2800]/20 rounded-2xl p-5"
        >
          <div className="text-center sm:text-left">
            <p className="text-white font-black text-lg">🏁 Collector's Corner</p>
            <p className="text-white/50 text-sm">Exclusive models, track sets & limited edition die-casts</p>
          </div>
          <Link
            to="/products?category=hot-wheels"
            className="shrink-0 inline-flex items-center gap-2 border-2 border-[#ff2800] text-[#ff2800] hover:bg-[#ff2800] hover:text-white font-bold px-6 py-2.5 rounded-full transition-all text-sm"
          >
            Browse Full Collection →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HotWheels;
