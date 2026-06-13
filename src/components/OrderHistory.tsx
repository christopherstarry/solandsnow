"use client";

import { useEffect, useState } from "react";
import { Order, OrdersResponse } from "@/lib/types";
import { deleteOrder, fetchOrders } from "@/lib/api";
import ProductImage from "./ProductImage";
import { formatJakartaDateTime, formatRupiah, toJakartaDateString } from "@/lib/utils";

interface OrderHistoryProps {
  refreshKey: number;
}

export default function OrderHistory({ refreshKey }: OrderHistoryProps) {
  const [date, setDate] = useState(toJakartaDateString());
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchOrders(date)
      .then(setData)
      .finally(() => setLoading(false));
  }, [date, refreshKey, localRefresh]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this order?")) return;
    await deleteOrder(id);
    setExpandedId((current) => (current === id ? null : current));
    setLocalRefresh((k) => k + 1);
  }

  const summary = data?.summary.find((s) => s.date === date);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-wood/10">
        <label className="block text-sm font-medium text-charcoal/80">
          Filter by Date (Jakarta)
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-sunshine p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-wood-dark">Sales</p>
          <p className="text-xl font-bold text-ink">
            {loading ? "-" : formatRupiah(summary?._sum.total ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl bg-sage p-4 text-center text-white shadow-sm">
          <p className="text-xs font-semibold text-white/90">Orders</p>
          <p className="text-xl font-bold">
            {loading ? "-" : summary?._count.id ?? 0}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center text-sm text-charcoal/70">Loading...</p>}
        {!loading && data?.orders.length === 0 && (
          <p className="text-center text-sm text-charcoal/70">No orders for this date.</p>
        )}
        {data?.orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            expanded={expandedId === order.id}
            onToggle={() =>
              setExpandedId(expandedId === order.id ? null : order.id)
            }
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onDelete,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-wood/10">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <p className="font-semibold text-ink">{order.customerName}</p>
          <p className="text-xs text-charcoal/70">
            {formatJakartaDateTime(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-ink">{formatRupiah(order.total)}</p>
          <p className="text-xs text-sage-dark">{expanded ? "Hide" : "Details"}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-wood/10 bg-cream-dark/50 px-4 py-3">
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <ProductImage
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    size={32}
                  />
                  <span className="text-ink">
                    {item.product.name}{" "}
                    <span className="text-charcoal/60">x{item.quantity}</span>
                  </span>
                </div>
                <span className="font-medium text-wood-dark">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-wood/10 pt-3">
            <p className="text-sm font-bold text-ink">Total</p>
            <p className="text-sm font-bold text-ink">
              {formatRupiah(order.total)}
            </p>
          </div>
          <button
            onClick={() => onDelete(order.id)}
            className="mt-3 w-full rounded-lg bg-cream py-2 text-xs font-semibold text-rust ring-1 ring-rust/20"
          >
            Delete Order
          </button>
        </div>
      )}
    </div>
  );
}
