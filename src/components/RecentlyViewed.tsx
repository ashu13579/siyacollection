import { useMemo } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ProductCard from "./ProductCard";

interface RecentlyViewedProps { excludeId?: string; }

const RecentlyViewed = ({ excludeId }: RecentlyViewedProps) => {
  const { getItems } = useRecentlyViewed();
  const items = useMemo(() => getItems().filter(p => p.id !== excludeId), [getItems, excludeId]);

  if (items.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <h2 className="text-2xl font-black mb-6">Recently Viewed 👀</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
