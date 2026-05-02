import { useCallback } from "react";
import { Product } from "./useProducts";

const KEY = "siya_recently_viewed";
const MAX = 6;

export function useRecentlyViewed() {
  const getItems = useCallback((): Product[] => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (error) {
      console.warn("Failed to read recently viewed items", error);
      return [];
    }
  }, []);

  const addItem = useCallback((product: Product) => {
    try {
      const items = getItems().filter(p => p.id !== product.id);
      const updated = [product, ...items].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn("Failed to store recently viewed items", error);
    }
  }, [getItems]);

  return { getItems, addItem };
}
