import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl mb-6">🔍</div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-3">404 — Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Looks like this page wandered off into another dimension. Let&apos;s get you back.
      </p>
      <div className="flex gap-3 flex-col sm:flex-row">
        <Link href="/" className="btn-primary py-2.5 px-6">Go Home</Link>
        <Link href="/products" className="btn-secondary py-2.5 px-6">Browse Products</Link>
      </div>
    </div>
  );
}

