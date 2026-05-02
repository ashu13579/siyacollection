import ProductCard from "./ProductCard";
import { useDbProducts, useDbCategories, dbToProduct } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";

const BestSellers = () => {
  const { data: dbProducts = [] } = useDbProducts();
  const { data: dbCategories = [] } = useDbCategories();

  const products = dbProducts.map((p) => dbToProduct(p, dbCategories));
  const best = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4);

  if (best.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent font-bold text-sm px-4 py-1.5 rounded-full mb-3">
              <Flame size={14} className="fill-accent" /> Trending Now
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-semibold leading-tight">Best Sellers</h2>
            <p className="text-muted-foreground font-semibold mt-1.5">Most loved by our happy families</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all duration-200 text-sm"
          >
            View All <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {best.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-primary/90 transition-all">
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
