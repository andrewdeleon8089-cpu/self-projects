import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-gray-200 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <span className="font-bold text-white">HobbyVault</span>
          </Link>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">
            <LayoutDashboard size={17} /> Dashboard
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">
            <Package size={17} /> Products
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">
            <ShoppingBag size={17} /> Orders
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 text-sm text-gray-400">
            <LogOut size={17} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
