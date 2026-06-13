"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { createProduct, updateProduct, deleteProduct } from "@/lib/api";
import ProductImage from "./ProductImage";

interface ProductManagerProps {
  products: Product[];
  onChange: () => void;
}

export default function ProductManager({ products, onChange }: ProductManagerProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;

    setLoading(true);
    try {
      const payload = {
        name,
        price: Number(price),
        imageUrl: imageUrl.trim() || null,
      };
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      resetForm();
      onChange();
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setPrice("");
    setImageUrl("");
    setEditingId(null);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setImageUrl(product.imageUrl ?? "");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      onChange();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-wood/10"
      >
        <h3 className="mb-3 font-semibold text-ink">
          {editingId ? "Edit Product" : "Add Product"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-charcoal/80">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
              placeholder="e.g. Peanut Butter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/80">
              Price (IDR)
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
              placeholder="30000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal/80">
              Image URL <span className="text-charcoal/50">(optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-sage py-2 text-sm font-semibold text-white shadow-sm active:bg-sage-dark disabled:opacity-60"
            >
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-cream-dark px-4 py-2 text-sm font-semibold text-ink ring-1 ring-wood/20"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-wood/10"
          >
            <div className="flex items-center gap-3">
              <ProductImage src={p.imageUrl} alt={p.name} size={56} />
              <div>
                <p className="font-semibold text-ink">{p.name}</p>
                <p className="text-sm text-wood-dark">{formatRupiah(p.price)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(p)}
                className="rounded-lg bg-sunshine px-3 py-1.5 text-xs font-semibold text-wood-dark"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="rounded-lg bg-cream-dark px-3 py-1.5 text-xs font-semibold text-rust ring-1 ring-rust/20"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
