"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      router.push(redirect);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required placeholder="you@example.com" />
      </div>
      <div>
        <label className="label">Password</label>
        <div className="relative">
          <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input pr-10" required placeholder="••••••••" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🎮</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Sign In to HobbyVault</h1>
          <p className="text-gray-400 text-sm mt-1">Access your orders and pre-reservations</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-600 hover:text-brand-700 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
