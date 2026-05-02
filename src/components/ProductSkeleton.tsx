const ProductSkeleton = () => (
  <div className="bg-card rounded-3xl overflow-hidden border-2 border-border animate-pulse">
    <div className="aspect-square bg-muted" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-muted rounded-full w-3/4" />
      <div className="h-3 bg-muted rounded-full w-1/2" />
      <div className="flex items-center justify-between mt-3">
        <div className="h-6 bg-muted rounded-full w-1/3" />
        <div className="w-10 h-10 bg-muted rounded-2xl" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => <ProductSkeleton key={i} />)}
  </div>
);

export default ProductSkeleton;
