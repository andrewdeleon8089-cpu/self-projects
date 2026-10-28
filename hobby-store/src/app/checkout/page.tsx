"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { isAllFandB, hasNonFandB, cartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [guestName, setGuestName] = useState("");
  const [guestContact, setGuestContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allFandB = isAllFandB(items);
  const needsAuth = hasNonFandB(items);

  useEffect(() => {
    if (!loading && !user && needsAuth) {
      router.push("/login?redirect=/checkout");
    }
  }, [loading, user, needsAuth, router]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Nothing to check out</h1>
        <Link href="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
      </div>
    );
  }

  const total = cartTotal(items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsAuth && !user) {
      toast.error("Please sign in first.");
      router.push("/login?redirect=/checkout");
      return;
    }
    if (allFandB && (!guestName.trim() || !guestContact.trim())) {
      toast.error("Please provide your name and contact info.");
      return;
    }

    setSubmitting(true);

    try {
      // Create order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id: user?.id ?? null,
          guest_name: allFandB && !user ? guestName : null,
          guest_contact: allFandB && !user ? guestContact : null,
          status: "pending",
          total_price: total,
        })
        .select()
        .single();

      if (orderErr || !order) throw new Error(orderErr?.message ?? "Failed to create order");

      // Insert order items
      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        quantity: i.quantity,
        unit_price: i.product.price,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw new Error(itemsErr.message);

      // Decrement stock
      for (const item of items) {
        await supabase.rpc("decrement_stock", {
          p_product_id: item.product.id,
          p_qty: item.quantity,
        });
      }

      clearCart();
      toast.success("Order placed successfully! 🎉");
      router.push(`/order-confirmation?order_id=${order.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order review */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">Your Order</h2>
          <div className="card divide-y divide-gray-50">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3 p-4">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={product.image_url ?? `https://placehold.co/56x56/f3e8ff/a21caf?text=📦`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">Qty: {quantity}</p>
                </div>
                <p className="font-semibold text-sm">{formatPrice(product.price * quantity)}</p>
              </div>
            ))}
            <div className="p-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {user && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
                ✅ Signed in as <strong>{user.email}</strong>
              </div>
            )}

            {allFandB && !user && (
              <div className="card p-5 space-y-4">
                <h2 className="font-semibold text-gray-800">Guest Information</h2>
                <p className="text-xs text-gray-500">F&B orders can be placed as a guest.</p>
                <div>
                  <label className="label">Your Name *</label>
                  <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="input" placeholder="Full name" required />
                </div>
                <div>
                  <label className="label">Contact / Table # *</label>
                  <input value={guestContact} onChange={(e) => setGuestContact(e.target.value)} className="input" placeholder="Phone number or table number" required />
                </div>
              </div>
            )}

            {needsAuth && !user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                🔐 You need to{" "}
                <Link href="/login?redirect=/checkout" className="underline font-semibold">sign in</Link>{" "}
                to order collectibles, games, consoles, or pre-orders.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (!user && needsAuth)}
              className="btn-primary w-full py-3 text-base"
            >
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
