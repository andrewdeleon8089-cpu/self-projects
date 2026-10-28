import Link from "next/link";
import { Suspense } from "react";

function ConfirmationContent() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Order Confirmed!</h1>
      <p className="text-gray-500 mb-8">
        Thank you for your order at HobbyVault. We&apos;ll prepare your items right away!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products" className="btn-primary py-2.5 px-6">Continue Shopping</Link>
        <Link href="/" className="btn-secondary py-2.5 px-6">Back to Home</Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}
