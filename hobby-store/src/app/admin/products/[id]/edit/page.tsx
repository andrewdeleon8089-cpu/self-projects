import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
