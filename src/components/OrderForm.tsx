"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { formatRupiah, toJakartaDateString } from "@/lib/utils";
import { createOrder } from "@/lib/api";

interface OrderFormProps {
  products: Product[];
  onCreated: () => void;
}

export default function OrderForm({ products, onCreated }: OrderFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState(toJakartaDateString());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = useMemo(() => {
    return Object.entries(quantities).reduce((sum, [productId, qty]) => {
      const product = products.find((p) => p.id === productId);
      return sum + (product ? product.price * qty : 0);
    }, 0);
  }, [quantities, products]);

  function setQuantity(productId: string, value: number) {
    setQuantities((prev) => {
      const next = { ...prev };
      if (value <= 0) delete next[productId];
      else next[productId] = value;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const items = Object.entries(quantities).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
    if (!customerName || items.length === 0) return;

    setLoading(true);
    setSuccess(false);
    try {
      await createOrder({ customerName, date, items });
      setCustomerName("");
      setQuantities({});
      setDate(toJakartaDateString());
      setSuccess(true);
      onCreated();
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-wood/10">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-charcoal/80">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
              placeholder="Customer A"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/80">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
              required
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-wood/10">
        <h3 className="mb-3 font-semibold text-ink">Products</h3>
        {products.length === 0 ? (
          <p className="text-sm text-charcoal/70">Add products first.</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => {
              const qty = quantities[p.id] ?? 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-cream p-3"
                >
                  <div>
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-wood-dark">
                      {formatRupiah(p.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(p.id, qty - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink shadow-sm ring-1 ring-wood/10"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold text-ink">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(p.id, qty + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage text-white shadow-sm active:bg-sage-dark"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-sunshine p-5 text-center shadow-sm">
        <p className="text-sm font-semibold text-wood-dark">Total</p>
        <p className="text-3xl font-bold text-ink">{formatRupiah(total)}</p>
      </div>

      {success && (
        <div className="rounded-xl bg-sage/10 p-3 text-center text-sm font-medium text-sage-dark">
          Order saved!
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !customerName || total === 0}
        className="w-full rounded-2xl bg-sage py-3 text-base font-bold text-white shadow-sm active:bg-sage-dark disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Order"}
      </button>
    </form>
  );
}
