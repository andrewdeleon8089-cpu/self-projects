"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Product, Category } from "@/types";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import Image from "next/image";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "tcg", label: "🃏 Trading Card Games" },
  { value: "collectibles", label: "🏆 Collectibles" },
  { value: "consoles", label: "🎮 Consoles" },
  { value: "games", label: "🕹️ Games" },
  { value: "f_and_b", label: "🍜 Snacks & Drinks (F&B)" },
];

interface Props {
  product?: Product;
}

export default function ProductForm({ product }: Props) {
  const isEdit = !!product;
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock_quantity?.toString() ?? "");
  const [category, setCategory] = useState<Category>(product?.category ?? "tcg");
  const [isPreorder, setIsPreorder] = useState(product?.is_preorder ?? false);
  const [preorderDate, setPreorderDate] = useState(product?.preorder_est_date ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return product?.image_url ?? null;
    const ext = imageFile.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, imageFile);
    if (error) throw new Error("Image upload failed: " + error.message);
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !stock) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const imageUrl = await uploadImage();
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        stock_quantity: parseInt(stock),
        category,
        is_preorder: isPreorder,
        preorder_est_date: isPreorder ? preorderDate || null : null,
        image_url: imageUrl,
      };

      if (isEdit && product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated!");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product added!");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      {/* Image upload */}
      <div>
        <label className="label">Product Image</label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Upload size={24} />
            </div>
          )}
          <label className="btn-secondary cursor-pointer text-sm">
            <span>Choose Image</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="label">Product Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Pokémon Booster Box — Scarlet & Violet" required />
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[100px] resize-y" placeholder="Describe the product, condition, edition, etc." />
      </div>

      {/* Category */}
      <div>
        <label className="label">Category *</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="input">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Price (PHP) *</label>
          <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input" placeholder="0.00" required />
        </div>
        <div>
          <label className="label">Stock Quantity *</label>
          <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="input" placeholder="0" required />
        </div>
      </div>

      {/* Pre-order toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIsPreorder(!isPreorder)}
            className={`relative w-11 h-6 rounded-full transition-colors ${isPreorder ? "bg-brand-600" : "bg-gray-300"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPreorder ? "translate-x-5" : ""}`} />
          </div>
          <span className="font-medium text-gray-700 text-sm">Mark as Pre-order</span>
        </label>
      </div>

      {isPreorder && (
        <div>
          <label className="label">Estimated Release / Arrival Date</label>
          <input type="text" value={preorderDate} onChange={(e) => setPreorderDate(e.target.value)} className="input" placeholder="e.g. Q1 2025, January 2025, TBA" />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5">
          {submitting ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary px-5">
          Cancel
        </button>
      </div>
    </form>
  );
}
