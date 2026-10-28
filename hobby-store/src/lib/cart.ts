import { CartItem, Product } from "@/types";

const CART_KEY = "hobby_store_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const cart = getCart();
  const existing = cart.find((i) => i.product.id === product.id);
  let updated: CartItem[];

  if (existing) {
    updated = cart.map((i) =>
      i.product.id === product.id
        ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock_quantity) }
        : i
    );
  } else {
    updated = [...cart, { product, quantity }];
  }

  saveCart(updated);
  return updated;
}

export function removeFromCart(productId: string): CartItem[] {
  const updated = getCart().filter((i) => i.product.id !== productId);
  saveCart(updated);
  return updated;
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart();
  let updated: CartItem[];

  if (quantity <= 0) {
    updated = cart.filter((i) => i.product.id !== productId);
  } else {
    updated = cart.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
  }

  saveCart(updated);
  return updated;
}

export function clearCart(): void {
  saveCart([]);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

export function isAllFandB(items: CartItem[]): boolean {
  return items.length > 0 && items.every((i) => i.product.category === "f_and_b");
}

export function hasNonFandB(items: CartItem[]): boolean {
  return items.some((i) => i.product.category !== "f_and_b");
}
