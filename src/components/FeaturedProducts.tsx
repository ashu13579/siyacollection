import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "./ProductSkeleton";
import { useDbProducts, useDbCategories, dbToProduct } from "@/hooks/useProducts";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const FeaturedProducts = () => {
  const { data: dbProducts = [], isLoading } = useDbProducts();
  const { data: dbCategories = [] } = useDbCategories();

  const products = dbProducts.map((p) => dbToProduct(p, dbCategories));
  const featured = products.filter((p) => p.badge);

  if (!isLoading && featured.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold text-sm px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={14} /> Handpicked Just For You
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-semibold mb-3">Featured Products</h2>
          <p className="text-muted-foreground font-semibold">Toys your kids will absolutely love ❤️</p>
        </motion.div>

        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
