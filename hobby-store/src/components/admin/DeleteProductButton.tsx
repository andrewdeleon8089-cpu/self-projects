"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

interface Props {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({ productId, productName }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      toast.error("Failed to delete product.");
    } else {
      toast.success(`"${productName}" deleted.`);
      router.refresh();
    }
    setDeleting(false);
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">Sure?</span>
        <button onClick={handleDelete} disabled={deleting} className="text-xs bg-red-600 text-white px-2 py-1 rounded font-medium hover:bg-red-700">
          {deleting ? "..." : "Yes"}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs border border-gray-200 px-2 py-1 rounded text-gray-600 hover:bg-gray-50">
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-colors"
      title="Delete product"
    >
      <Trash2 size={13} />
    </button>
  );
}
