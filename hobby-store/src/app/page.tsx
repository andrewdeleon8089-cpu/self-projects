import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

const HIGHLIGHTS = [
  { emoji: "🃏", label: "TCGs", href: "/products?category=tcg", color: "from-blue-500 to-blue-700" },
  { emoji: "🏆", label: "Collectibles", href: "/products?category=collectibles", color: "from-purple-500 to-purple-700" },
  { emoji: "🎮", label: "Consoles", href: "/products?category=consoles", color: "from-green-500 to-green-700" },
  { emoji: "🕹️", label: "Games", href: "/products?category=games", color: "from-orange-500 to-orange-700" },
  { emoji: "🍜", label: "Snacks", href: "/products?category=f_and_b", color: "from-red-400 to-pink-600" },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from("products")
    .select("*")
    .gt("stock_quantity", 0)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: preorders } = await supabase
    .from("products")
    .select("*")
    .eq("is_preorder", true)
    .limit(4);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow">
            🎮 Welcome to <span className="text-yellow-300">HobbyVault</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Your local treasure trove for trading card games, collectibles, gaming consoles, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="bg-white text-brand-700 hover:bg-brand-50 font-bold py-3 px-8 rounded-full transition-colors">
              Browse All Products
            </Link>
            <Link href="/products?category=f_and_b" className="bg-brand-800 hover:bg-brand-900 text-white font-semibold py-3 px-8 rounded-full transition-colors border border-brand-500">
              🍜 Snacks & Drinks
            </Link>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {HIGHLIGHTS.map((h) => (
            <Link
              key={h.href}
              href={h.href}
              className={`bg-gradient-to-br ${h.color} text-white rounded-2xl p-6 text-center hover:scale-105 transition-transform shadow`}
            >
              <div className="text-4xl mb-2">{h.emoji}</div>
              <div className="font-bold text-sm">{h.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pre-orders section */}
      {preorders && preorders.length > 0 && (
        <section className="bg-amber-50 border-y border-amber-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">⏳ Coming Soon — Pre-Orders</h2>
              <Link href="/products?preorder=true" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {preorders.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest products */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🆕 New Arrivals</h2>
          <Link href="/products" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        {featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No products yet. Check back soon!</p>
        )}
      </section>

      {/* Info banner */}
      <section className="bg-brand-50 border-t border-brand-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-bold text-gray-900 mb-1">Secure Pre-orders</h3>
              <p className="text-sm text-gray-500">Reserve limited items with your account — no payment until arrival.</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-bold text-gray-900 mb-1">Live Stock Tracking</h3>
              <p className="text-sm text-gray-500">Always see exactly how many units are left in real time.</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🍜</div>
              <h3 className="font-bold text-gray-900 mb-1">F&B No Sign-in Needed</h3>
              <p className="text-sm text-gray-500">Order snacks and drinks as a guest — quick and easy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
