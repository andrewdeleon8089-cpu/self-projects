import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "HobbyVault — Collectibles, TCGs, Games & More",
  description:
    "Your one-stop hobby shop for trading card games, collectibles, consoles, games, and snacks. Browse our full inventory and order online.",
  keywords: ["hobby store", "TCG", "collectibles", "consoles", "games", "trading cards"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: "10px",
                  background: "#333",
                  color: "#fff",
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
