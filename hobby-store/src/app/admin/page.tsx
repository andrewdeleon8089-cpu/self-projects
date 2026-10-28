import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: productCount }, { count: orderCount }, { data: lowStock }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("id, name, stock_quantity").lte("stock_quantity", 3).order("stock_quantity"),
  ]);

  const stats = [
    { label: "Total Products", value: productCount ?? 0, emoji: "📦", href: "/admin/products" },
    { label: "Total Orders", value: orderCount ?? 0, emoji: "🛒", href: "/admin/orders" },
    { label: "Low Stock Items", value: lowStock?.length ?? 0, emoji: "⚠️", href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{s.emoji}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {lowStock && lowStock.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">⚠️ Low Stock Alert</h2>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-700">{p.name}</span>
                <span className={`font-semibold ${p.stock_quantity === 0 ? "text-red-500" : "text-orange-500"}`}>
                  {p.stock_quantity === 0 ? "Out of Stock" : `${p.stock_quantity} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Link href="/admin/products/new" className="btn-primary">+ Add New Product</Link>
        <Link href="/admin/orders" className="btn-secondary">View All Orders</Link>
      </div>
    </div>
  );
}
