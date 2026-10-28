"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/lib/utils";

const CATEGORIES = ["all", "tcg", "collectibles", "consoles", "games", "f_and_b"];

export default function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            active === cat
              ? "bg-brand-600 text-white border-brand-600 shadow"
              : "bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600"
          }`}
        >
          <span>{CATEGORY_ICONS[cat]}</span>
          <span className="hidden sm:inline">{CATEGORY_LABELS[cat]}</span>
          <span className="sm:hidden">{cat === "all" ? "All" : cat.toUpperCase().replace("_AND_B", "&B")}</span>
        </button>
      ))}
    </div>
  );
}
