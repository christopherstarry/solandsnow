"use client";

import { useRef, useState } from "react";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { createProduct, updateProduct, deleteProduct, uploadImage } from "@/lib/api";
import ProductImage from "./ProductImage";

interface ProductManagerProps {
  products: Product[];
  onChange: () => void;
}

export default function ProductManager({ products, onChange }: ProductManagerProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setImageFile(file);

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
      clearImage();
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    if (imageFile && !imageUrl) return;

    setLoading(true);
    try {
      const payload = {
        name,
        price: Number(price),
        imageUrl: imageUrl ?? null,
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
    clearImage();
    setEditingId(null);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setImageUrl(product.imageUrl ?? null);
    setImagePreview(product.imageUrl ?? null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const hasNewImage = imageFile != null;

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
              Image <span className="text-charcoal/50">(optional)</span>
            </label>

            {imagePreview ? (
              <div className="mt-1 flex items-center gap-3 rounded-xl border border-wood/20 bg-cream p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover ring-1 ring-wood/10"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs text-charcoal/70">
                    {hasNewImage
                      ? imageFile!.name
                      : editingId
                      ? "Current image"
                      : "Uploaded"}
                  </p>
                  {uploading && (
                    <p className="text-xs text-sage-dark">Uploading...</p>
                  )}
                  {imageUrl && !uploading && (
                    <p className="text-xs text-sage-dark">Ready</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-xs font-semibold text-rust"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="mt-1 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-wood/20 bg-cream p-5 hover:border-sage/40 transition-colors">
                <div className="text-center">
                  <p className="text-sm font-medium text-charcoal/70">
                    Tap to select photo
                  </p>
                  <p className="mt-0.5 text-xs text-charcoal/50">
                    JPEG, PNG, GIF, WebP up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading || uploading || (hasNewImage && !imageUrl)}
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
