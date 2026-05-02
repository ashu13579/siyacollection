import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/ProductSkeleton";
import { useDbProducts, useDbCategories, dbToProduct } from "@/hooks/useProducts";
import SEO from "@/components/SEO";
import { Search, SlidersHorizontal, PackageX } from "lucide-react";
import { motion } from "framer-motion";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const searchQuery = searchParams.get("search")?.toLowerCase() ?? "";
  const [sort, setSort] = useState("popular");
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => { setSearchInput(searchQuery); }, [searchQuery]);

  const { data: dbProducts = [], isLoading } = useDbProducts();
  const { data: dbCategories = [] } = useDbCategories();

  const products = useMemo(() => dbProducts.map((p) => dbToProduct(p, dbCategories)), [dbProducts, dbCategories]);

  const filtered = useMemo(() => {
    let list = categoryFilter ? products.filter((p) => p.category === categoryFilter) : [...products];
    if (searchQuery) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery)
      );
    }
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [products, categoryFilter, searchQuery, sort]);

  const activeCat = dbCategories.find((c) => c.slug === categoryFilter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) setSearchParams({ search: q });
    else setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={activeCat ? activeCat.name : "All Products"} description="Shop premium toys for kids — soft toys, RC cars, educational games and more." url="/products" />
      <Header />

      {/* Page header band */}
      <div className="bg-foreground py-10 md:py-14">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-semibold text-background mb-2"
          >
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeCat
              ? `${activeCat.icon || "🎁"} ${activeCat.name}`
              : "🛍️ All Products"}
          </motion.h1>
          <p className="text-background/50 font-semibold">{filtered.length} products found</p>

          {/* Inline search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mt-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search toys…"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-background/10 border border-background/20 text-background placeholder:text-background/40 font-semibold text-sm focus:outline-none focus:border-secondary"
              />
            </div>
            <button type="submit" className="bg-secondary text-secondary-foreground font-bold px-5 py-3 rounded-2xl text-sm hover:opacity-90 transition-all">
              Search
            </button>
          </form>
        </div>
      </div>

      <main className="container py-8 md:py-12">
        {/* Filters row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            <Link
              to="/products"
              className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                !categoryFilter
                  ? "bg-primary text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              All
            </Link>
            {dbCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                  categoryFilter === cat.slug
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {cat.icon || "🎁"} {cat.name}
              </Link>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-card border-2 border-border rounded-2xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <PackageX size={64} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-2xl font-display font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground font-semibold mb-6">Try a different search or category</p>
            <Link to="/products" className="bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition-all">
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Products;
