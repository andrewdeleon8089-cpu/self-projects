"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Check your email to confirm.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🎮</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Create an Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join HobbyVault to place orders and pre-orders</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required placeholder="you@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input pr-10" required placeholder="At least 6 characters" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" required placeholder="Repeat your password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
