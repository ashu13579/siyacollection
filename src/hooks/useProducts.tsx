import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as staticProducts } from "@/data/products";

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number;
  category_id: string | null;
  images: string[] | null;
  rating: number | null;
  reviews: number | null;
  in_stock: boolean | null;
  badge: string | null;
  variants: any;
  created_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  image_url: string | null;
  sort_order: number | null;
}

export interface DbBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean | null;
  sort_order: number | null;
}

// Convert DB product to the format components expect
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  variants?: { label: string; options: string[] }[];
}

export function dbToProduct(p: DbProduct, categories: DbCategory[]): Product {
  const cat = categories.find((c) => c.id === p.category_id);
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: Number(p.price),
    originalPrice: Number(p.original_price),
    category: cat?.slug || "",
    images: p.images?.length ? p.images : ["/placeholder.svg"],
    rating: Number(p.rating) || 0,
    reviews: Number(p.reviews) || 0,
    inStock: p.in_stock ?? true,
    badge: p.badge || undefined,
    variants: Array.isArray(p.variants) ? p.variants : undefined,
  };
}

// BUG FIX: retry: 1 (was default 3) so the UI doesn't hang for 30s on a bad key.
// On error, returns [] so components immediately fall back to static data.
export function useDbProducts() {
  return useQuery({
    queryKey: ["db-products"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []) as DbProduct[];
      } catch {
        // Return empty — components will use static fallback
        return [] as DbProduct[];
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}

export function useDbCategories() {
  return useQuery({
    queryKey: ["db-categories"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order");
        if (error) throw error;
        return (data || []) as DbCategory[];
      } catch {
        return [] as DbCategory[];
      }
    },
    retry: 1,
  });
}

export function useDbBanners() {
  return useQuery({
    queryKey: ["db-banners"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("banners")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");
        if (error) throw error;
        return (data || []) as DbBanner[];
      } catch {
        return [] as DbBanner[];
      }
    },
    retry: 1,
  });
}

// BUG FIX: Unified hook that returns DB products if available, else static fallback.
// All sections (FeaturedProducts, BestSellers, HotWheels) should use this.
export function useProducts(): { products: Product[]; isLoading: boolean } {
  const { data: dbProducts = [], isLoading } = useDbProducts();
  const { data: dbCategories = [] } = useDbCategories();

  if (dbProducts.length > 0) {
    return {
      products: dbProducts.map((p) => dbToProduct(p, dbCategories)),
      isLoading,
    };
  }

  // Fallback to static data while loading OR when DB is empty/unreachable
  return {
    products: isLoading ? [] : staticProducts,
    isLoading,
  };
}
