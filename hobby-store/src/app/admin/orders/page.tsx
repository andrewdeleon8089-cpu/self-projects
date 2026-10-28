import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(name))")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Order ID</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Items</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Total</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    {order.customer_id ? (
                      <span className="text-gray-700">Registered user</span>
                    ) : (
                      <span className="text-gray-500">{order.guest_name ?? "Guest"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{order.order_items?.length ?? 0} item(s)</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(order.total_price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "confirmed" ? "bg-green-100 text-green-700" :
                      order.status === "completed" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!orders || orders.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">🛒</div>
              <p>No orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
