import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎮</span>
              <span className="font-bold text-xl text-white">HobbyVault</span>
            </div>
            <p className="text-sm text-gray-400">
              Your local hobby shop for TCGs, collectibles, consoles, games, and snacks.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=tcg" className="hover:text-white transition-colors">Trading Card Games</Link></li>
              <li><Link href="/products?category=collectibles" className="hover:text-white transition-colors">Collectibles</Link></li>
              <li><Link href="/products?category=consoles" className="hover:text-white transition-colors">Consoles</Link></li>
              <li><Link href="/products?category=games" className="hover:text-white transition-colors">Games</Link></li>
              <li><Link href="/products?category=f_and_b" className="hover:text-white transition-colors">Snacks & Drinks</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">View Cart</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} HobbyVault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
