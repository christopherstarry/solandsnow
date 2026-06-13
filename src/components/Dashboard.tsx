"use client";

import { Product, OrdersResponse } from "@/lib/types";
import { formatRupiah, toJakartaDateString } from "@/lib/utils";
import { useEffect, useState } from "react";
import { fetchOrders } from "@/lib/api";

interface DashboardProps {
  products: Product[];
}

export default function Dashboard({ products }: DashboardProps) {
  const today = toJakartaDateString();
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchOrders(today)
      .then(setData)
      .finally(() => setLoading(false));
  }, [today]);

  const todaySummary = data?.summary.find((s) => s.date === today);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-wood/10">
        <p className="text-sm font-medium text-charcoal/70">Today (Jakarta)</p>
        <p className="mt-1 text-3xl font-bold text-ink">{today}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-sunshine p-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-wood-dark">Total Sales</p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {loading ? "-" : formatRupiah(todaySummary?._sum.total ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl bg-sage p-5 text-center text-white shadow-sm">
          <p className="text-sm font-semibold text-white/90">Orders</p>
          <p className="mt-1 text-2xl font-bold">
            {loading ? "-" : todaySummary?._count.id ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-cream-dark p-5 shadow-sm ring-1 ring-wood/10">
        <h3 className="font-semibold text-ink">Products Ready</h3>
        <ul className="mt-3 space-y-2">
          {products.length === 0 && (
            <li className="text-sm text-charcoal/70">No products yet.</li>
          )}
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium text-ink">{p.name}</span>
              <span className="text-wood-dark">{formatRupiah(p.price)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
