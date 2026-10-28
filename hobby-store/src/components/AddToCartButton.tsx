"use client";

import { useState } from "react";
import { ShoppingCart, Clock } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    if (product.stock_quantity === 0) return;
    addItem(product, qty);
    toast.success(`Added ${qty}× ${product.name} to cart!`);
  };

  if (product.stock_quantity === 0) {
    return (
      <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed py-3 text-base">
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label className="label">Qty:</label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            −
          </button>
          <span className="px-4 py-2 font-semibold text-sm">{qty}</span>
          <button
            onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>
        <span className="text-xs text-gray-400">({product.stock_quantity} available)</span>
      </div>
      <button onClick={handleAdd} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
        {product.is_preorder ? <Clock size={18} /> : <ShoppingCart size={18} />}
        {product.is_preorder ? "Pre-order Now" : "Add to Cart"}
      </button>
    </div>
  );
}
