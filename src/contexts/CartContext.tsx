import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/hooks/useProducts";

export interface CartItem {
  product: Product;
  quantity: number;
  variants?: Record<string, string>; // e.g. { Size: "4ft", Color: "Pink" }
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variants?: Record<string, string>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "siya_cart";

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Failed to load cart from localStorage", error);
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Failed to save cart to localStorage", error);
    }
  }, [items]);

  // Cart key includes variant combo so same product with different variants = separate cart lines
  const itemKey = (productId: string, variants?: Record<string, string>) =>
    productId + (variants ? "__" + Object.entries(variants).sort().map(([k,v]) => `${k}:${v}`).join(",") : "");

  const addToCart = useCallback((product: Product, variants?: Record<string, string>) => {
    const key = itemKey(product.id, variants);
    setItems(prev => {
      const existing = prev.find(i => itemKey(i.product.id, i.variants) === key);
      if (existing) return prev.map(i => itemKey(i.product.id, i.variants) === key ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1, variants }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) setItems(prev => prev.filter(i => i.product.id !== productId));
    else setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
