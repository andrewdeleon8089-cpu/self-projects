"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { hasNonFandB } from "@/lib/cart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h1>
        <p className="text-gray-400 mb-6">Start shopping to add items here!</p>
        <Link href="/products" className="btn-primary py-2.5 px-6">Browse Products</Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (hasNonFandB(items) && !user) {
      toast.error("Please sign in to order collectibles, games, or pre-orders.");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🛒 Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card flex gap-4 p-4">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={product.image_url ?? `https://placehold.co/80x80/f3e8ff/a21caf?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-snug mb-1 truncate">{product.name}</p>
                <p className="text-xs text-gray-400 capitalize mb-2">{product.category.replace("_", " & ")}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                    <button onClick={() => updateQty(product.id, quantity - 1)} className="px-2 py-1 hover:bg-gray-100">−</button>
                    <span className="px-3 py-1 font-medium">{quantity}</span>
                    <button onClick={() => updateQty(product.id, Math.min(product.stock_quantity, quantity + 1))} className="px-2 py-1 hover:bg-gray-100">+</button>
                  </div>
                  <button onClick={() => removeItem(product.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">{formatPrice(product.price * quantity)}</p>
                <p className="text-xs text-gray-400">{formatPrice(product.price)} each</p>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors mt-2">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          {hasNonFandB(items) && !user && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 mb-4">
              🔐 Sign in required for collectibles & games orders.
            </div>
          )}
          <button onClick={handleCheckout} className="btn-primary w-full py-3 text-base">
            Proceed to Checkout
          </button>
          <Link href="/products" className="block text-center text-sm text-brand-600 hover:text-brand-700 mt-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
