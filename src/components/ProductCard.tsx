import { motion } from "framer-motion";
import SafeImage from "./SafeImage";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart! 🎉`);
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
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <Link to={`/product/${product.id}`} className="block group">
        <div className="bg-card rounded-3xl overflow-hidden shadow-card border-2 border-border hover:border-secondary hover:shadow-toy transition-all duration-300">

          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted/60">
            <SafeImage
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.badge && (
                <span className="bg-accent text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-foreground text-background text-[11px] font-black px-3 py-1 rounded-full shadow-sm">
                  {discount}% OFF
                </span>
              )}
            </div>

            {!product.inStock && (
              <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-card text-foreground font-display font-semibold px-5 py-2 rounded-2xl text-sm shadow">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className={`absolute top-3 right-3 w-9 h-9 rounded-2xl shadow-md flex items-center justify-center transition-all duration-200
                ${wishlisted
                  ? "bg-accent text-white scale-110"
                  : "bg-card/85 backdrop-blur-sm text-muted-foreground hover:text-accent hover:bg-card hover:scale-110"
                }`}
              aria-label="Wishlist"
            >
              <Heart size={16} className={wishlisted ? "fill-white" : ""} />
            </button>

            {/* Quick-add hover overlay */}
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="w-full bg-primary/95 backdrop-blur-sm text-white font-bold py-3 text-sm flex items-center justify-center gap-2 hover:bg-primary transition-colors disabled:opacity-50"
              >
                <ShoppingCart size={16} /> Quick Add to Cart
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-display font-semibold text-foreground truncate text-base">{product.name}</h3>

            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12}
                    className={i < Math.round(product.rating) ? "fill-secondary text-secondary" : "fill-muted text-muted"} />
                ))}
              </div>
              <span className="text-xs font-bold text-foreground">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-display font-semibold text-foreground">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/85 hover:scale-110 transition-all shadow-md disabled:opacity-40"
                aria-label="Add to cart"
              >
                <ShoppingCart size={17} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
