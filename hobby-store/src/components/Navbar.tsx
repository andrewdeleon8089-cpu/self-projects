"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Settings, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const { count } = useCart();
  const { user, profile, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/products?category=tcg", label: "TCGs" },
    { href: "/products?category=collectibles", label: "Collectibles" },
    { href: "/products?category=consoles", label: "Consoles" },
    { href: "/products?category=games", label: "Games" },
    { href: "/products?category=f_and_b", label: "Snacks & Drinks" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <span className="font-bold text-xl text-brand-700">HobbyVault</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.slice(0, 2).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? "text-brand-600"
                    : "text-gray-600 hover:text-brand-600"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="relative group">
              <button className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                Categories ▾
              </button>
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {navLinks.slice(2).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-brand-600 transition-colors"
              title="Cart"
            >
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-brand-600 transition-colors"
                >
                  <User size={20} />
                  <span className="hidden sm:block max-w-[120px] truncate">
                    {profile?.email?.split("@")[0] ?? "Account"}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                    <p className="px-4 py-2 text-xs text-gray-400 truncate">{profile?.email}</p>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-brand-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={14} /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-primary text-sm py-1.5 px-4"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
