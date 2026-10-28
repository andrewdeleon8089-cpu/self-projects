import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import StockBadge from "@/components/StockBadge";
import AddToCartButton from "@/components/AddToCartButton";
import { Clock, Tag } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow">
          <Image
            src={
              product.image_url ??
              `https://placehold.co/600x600/f3e8ff/a21caf?text=${encodeURIComponent(product.name)}`
            }
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          {product.is_preorder && (
            <div className="absolute top-4 left-4 bg-amber-500 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Clock size={14} /> PRE-ORDER
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={14} className="text-brand-600" />
            <span className="text-sm text-brand-600 font-semibold capitalize">
              {CATEGORY_LABELS[product.category] ?? product.category}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{product.name}</h1>

          <div className="text-3xl font-bold text-brand-700 mb-4">{formatPrice(product.price)}</div>

          <StockBadge qty={product.stock_quantity} />

          {product.is_preorder && product.preorder_est_date && (
            <p className="text-sm text-amber-600 mt-2">
              ⏳ Estimated arrival: <strong>{product.preorder_est_date}</strong>
            </p>
          )}

          {product.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Notice for non-F&B */}
          {product.category !== "f_and_b" && (
            <div className="mt-4 bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-700">
              🔐 You&apos;ll need to <strong>sign in</strong> to place an order for this item.
            </div>
          )}

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
