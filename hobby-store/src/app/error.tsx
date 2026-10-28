"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl mb-6">⚠️</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Something went wrong</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        An unexpected error occurred. Please try again or return to the homepage.
      </p>
      <div className="flex gap-3 flex-col sm:flex-row">
        <button onClick={reset} className="btn-primary py-2.5 px-6">Try Again</button>
        <Link href="/" className="btn-secondary py-2.5 px-6">Go Home</Link>
      </div>
    </div>
  );
}

