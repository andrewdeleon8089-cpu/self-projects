import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Suspense } from "react";
import { Product } from "@/types";
import { CATEGORY_LABELS } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ category?: string; preorder?: string; q?: string }>;
}

async function ProductGrid({ category, preorder, q }: { category?: string; preorder?: string; q?: string }) {
  const supabase = await createClient();
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (preorder === "true") {
    query = query.eq("is_preorder", true);
  }
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: products, error } = await query;

  if (error) return <p className="text-red-500 text-center py-10">Error loading products.</p>;
  if (!products || products.length === 0)
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm mt-1">Try a different category or search term.</p>
      </div>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p: Product) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = sp.category;
  const preorder = sp.preorder;
  const q = sp.q;

  const heading = category ? CATEGORY_LABELS[category] ?? "Products" : "All Products";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h1>
        {/* Search */}
        <form method="GET" className="flex gap-2 mb-4 max-w-md">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search products..."
            className="input flex-1"
          />
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
        <Suspense fallback={null}>
          <CategoryFilter />
        </Suspense>
      </div>

      {/* Products */}
      <Suspense
        key={`${category}-${preorder}-${q}`}
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ProductGrid category={category} preorder={preorder} q={q} />
      </Suspense>
    </div>
  );
}
