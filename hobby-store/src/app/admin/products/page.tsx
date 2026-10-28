import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import Image from "next/image";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Product</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Category</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Price</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Stock</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Pre-order</th>
                <th className="text-right px-4 py-3 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={p.image_url ?? `https://placehold.co/40x40/f3e8ff/a21caf?text=📦`}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-900 max-w-[200px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.category.replace("_", " & ")}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.stock_quantity === 0 ? "text-red-500" : p.stock_quantity <= 3 ? "text-orange-500" : "text-green-600"}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.is_preorder ? (
                      <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">Yes</span>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-brand-600 hover:text-brand-700 font-medium text-xs border border-brand-200 px-2 py-1 rounded">
                        Edit
                      </Link>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!products || products.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📦</div>
              <p>No products yet. <Link href="/admin/products/new" className="text-brand-600 hover:underline">Add your first product</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
