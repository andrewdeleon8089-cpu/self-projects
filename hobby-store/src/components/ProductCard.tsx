"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Clock } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getStockStatus } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const stock = getStockStatus(product.stock_quantity);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock_quantity === 0) return;
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link href={`/products/${product.id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <Image
          src={product.image_url ?? `https://placehold.co/400x400/f3e8ff/a21caf?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.is_preorder && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={10} /> PRE-ORDER
          </div>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold px-3 py-1 rounded-full text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-brand-600 font-medium capitalize mb-1">
          {product.category.replace("_", " & ")}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 flex-1">
          {product.name}
        </h3>
        <p className={`text-xs font-medium mb-3 ${stock.color}`}>{stock.label}</p>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <ShoppingCart size={13} />
            {product.is_preorder ? "Pre-order" : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}
