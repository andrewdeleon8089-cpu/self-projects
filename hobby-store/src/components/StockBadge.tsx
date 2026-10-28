import { getStockStatus } from "@/lib/utils";

export default function StockBadge({ qty }: { qty: number }) {
  const { label, color } = getStockStatus(qty);
  return (
    <span className={`text-sm font-semibold ${color}`}>{label}</span>
  );
}
