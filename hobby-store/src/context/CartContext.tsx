"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { CartItem, Product } from "@/types";
import * as cartLib from "@/lib/cart";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartLib.getCart());
  }, []);

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems(cartLib.addToCart(product, qty));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(cartLib.removeFromCart(productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems(cartLib.updateQuantity(productId, qty));
  }, []);

  const clearCart = useCallback(() => {
    cartLib.clearCart();
    setItems([]);
  }, []);

  const total = cartLib.cartTotal(items);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
