import { OrderInput } from "./types";

export async function fetchProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function createProduct(data: { name: string; price: number }) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(
  id: string,
  data: { name?: string; price?: number }
) {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
}

export async function fetchOrders(date?: string) {
  const url = date ? `/api/orders?date=${date}` : "/api/orders";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function createOrder(data: OrderInput) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
}

export async function deleteOrder(id: string) {
  const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete order");
  return res.json();
}

export async function exportOrders(date?: string) {
  const url = date ? `/api/export?date=${date}` : "/api/export";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to export orders");
  return res.json();
}
