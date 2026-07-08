"use client";

import { useMemo, useState } from "react";
import { Product, Order } from "@/lib/types";
import { formatRupiah, toJakartaDateString } from "@/lib/utils";
import { createOrder, sendInvoice } from "@/lib/api";
import ProductImage from "./ProductImage";
import Modal from "./Modal";

interface OrderFormProps {
  products: Product[];
  onCreated: () => void;
}

export default function OrderForm({ products, onCreated }: OrderFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState(toJakartaDateString());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [invoiceEmail, setInvoiceEmail] = useState("");
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, search]);

  const selectedItems = useMemo(() => {
    return Object.entries(quantities)
      .map(([productId, qty]) => {
        const product = products.find((p) => p.id === productId);
        return product ? { product, qty } : null;
      })
      .filter(Boolean) as { product: Product; qty: number }[];
  }, [quantities, products]);

  const total = useMemo(() => {
    return selectedItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  }, [selectedItems]);

  function setQuantity(productId: string, value: number) {
    setQuantities((prev) => {
      const next = { ...prev };
      if (value <= 0) delete next[productId];
      else next[productId] = value;
      return next;
    });
  }

  function openModal() {
    if (!customerName || selectedItems.length === 0) return;
    setNeedsInvoice(false);
    setShowModal(true);
  }

  async function confirmOrder() {
    const items = Object.entries(quantities).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
    if (!customerName || items.length === 0) return;

    setLoading(true);
    try {
      const order = await createOrder({ customerName, date, items, needsInvoice });
      setCreatedOrder(order);
      setShowModal(false);
      setCustomerName("");
      setQuantities({});
      setDate(toJakartaDateString());
      setSearch("");
      setInvoiceEmail("");
      setInvoiceSent(false);
      setInvoiceError("");
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvoice() {
    if (!createdOrder || !invoiceEmail) return;
    setSendingInvoice(true);
    setInvoiceError("");
    try {
      await sendInvoice(createdOrder.id, invoiceEmail);
      setInvoiceSent(true);
      setCreatedOrder((prev) => prev ? { ...prev, invoiceSent: true } : null);
    } catch {
      setInvoiceError("Failed to send invoice. Please try again.");
    } finally {
      setSendingInvoice(false);
    }
  }

  function resetOrder() {
    setCreatedOrder(null);
    setInvoiceEmail("");
    setInvoiceSent(false);
    setInvoiceError("");
  }

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-5"
      >
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
          <div className="flex items-center gap-4">
            <div className="flex-1 rounded-xl bg-sunshine p-3 text-center">
              <p className="text-xs font-semibold text-wood-dark">Total</p>
              <p className="text-xl font-bold text-ink">{formatRupiah(total)}</p>
            </div>
            <button
              type="button"
              onClick={openModal}
              disabled={loading || !customerName || total === 0}
              className="flex-1 rounded-xl bg-sage py-3 text-sm font-bold text-white shadow-sm active:bg-sage-dark disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Order"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-wood/10">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Products</h3>
            <span className="text-xs text-charcoal/60">
              {Object.keys(quantities).length} selected
            </span>
          </div>

          <div className="mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product..."
              className="w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          </div>

          {products.length === 0 ? (
            <p className="text-sm text-charcoal/70">Add products first.</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-charcoal/70">No products match.</p>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((p) => {
                const qty = quantities[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-cream p-3"
                  >
                    <div className="flex items-center gap-3">
                      <ProductImage src={p.imageUrl} alt={p.name} size={44} />
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-wood-dark">
                          {formatRupiah(p.price)}
                        </p>
                      </div>
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
      </form>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Order"
      >
        <div className="space-y-4">
          <div className="text-sm">
            <p>
              <span className="text-charcoal/60">Customer:</span>{" "}
              <span className="font-semibold text-ink">{customerName}</span>
            </p>
            <p>
              <span className="text-charcoal/60">Date:</span>{" "}
              <span className="font-semibold text-ink">{date}</span>
            </p>
          </div>

          <div className="rounded-xl bg-cream p-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-charcoal/60">
                  <th className="pb-2 text-left font-medium">Item</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map(({ product, qty }) => (
                  <tr key={product.id} className="border-t border-wood/10">
                    <td className="py-2 text-ink">{product.name}</td>
                    <td className="py-2 text-right text-charcoal/70">{qty}</td>
                    <td className="py-2 text-right font-medium text-wood-dark">
                      {formatRupiah(product.price * qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl bg-sunshine p-3 text-center">
            <p className="text-lg font-bold text-ink">{formatRupiah(total)}</p>
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-cream p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={needsInvoice}
              onChange={(e) => setNeedsInvoice(e.target.checked)}
              className="h-5 w-5 rounded accent-sage"
            />
            <span className="text-sm font-medium text-ink">Need Invoice?</span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 rounded-xl bg-cream py-2.5 text-sm font-semibold text-charcoal/70"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmOrder}
              disabled={loading}
              className="flex-1 rounded-xl bg-sage py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {loading ? "Saving..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </Modal>

      {createdOrder && needsInvoice && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sage/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">Order Created</h3>
            <span className="text-xs font-medium text-sage-dark">
              #{createdOrder.id.slice(0, 8)}
            </span>
          </div>

          {invoiceSent ? (
            <div className="rounded-xl bg-sage/10 p-4 text-center">
              <p className="text-sm font-semibold text-sage-dark">
                Invoice sent to {invoiceEmail}
              </p>
              <button
                onClick={resetOrder}
                className="mt-3 text-sm font-medium text-sage underline"
              >
                New Order
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-charcoal/70">
                Enter the customer&apos;s email to send the invoice.
              </p>
              <input
                type="email"
                value={invoiceEmail}
                onChange={(e) => setInvoiceEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
              />
              {invoiceError && (
                <p className="text-sm font-medium text-rust">{invoiceError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={resetOrder}
                  className="flex-1 rounded-xl bg-cream py-2 text-sm font-semibold text-charcoal/70"
                >
                  Skip
                </button>
                <button
                  onClick={handleSendInvoice}
                  disabled={sendingInvoice || !invoiceEmail}
                  className="flex-1 rounded-xl bg-sage py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {sendingInvoice ? "Sending..." : "Send Invoice"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {createdOrder && !needsInvoice && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-wood/10 space-y-3">
          <div className="rounded-xl bg-sage/10 p-3 text-center text-sm font-medium text-sage-dark">
            Order saved!
          </div>
          <button
            onClick={resetOrder}
            className="w-full rounded-xl bg-cream py-2 text-sm font-semibold text-ink"
          >
            New Order
          </button>
        </div>
      )}
    </>
  );
}
