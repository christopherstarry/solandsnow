"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/api";
import { Product } from "@/lib/types";
import { toJakartaDateString } from "@/lib/utils";
import Dashboard from "@/components/Dashboard";
import ProductManager from "@/components/ProductManager";
import OrderForm from "@/components/OrderForm";
import OrderHistory from "@/components/OrderHistory";
import ExportButton from "@/components/ExportButton";

type Tab = "dashboard" | "products" | "new" | "history";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exportFrom, setExportFrom] = useState(toJakartaDateString());
  const [exportTo, setExportTo] = useState(toJakartaDateString());

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function refreshAll() {
    loadProducts();
    setRefreshKey((k) => k + 1);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "new", label: "New Order" },
    { key: "history", label: "History" },
    { key: "products", label: "Products" },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 pb-28 pt-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          Sol & Snow
        </h1>
        <p className="mt-1 text-sm font-medium text-charcoal/70">
          Dog Snack Orders
        </p>
      </header>

      {loading ? (
        <p className="py-10 text-center text-sm text-charcoal/70">Loading...</p>
      ) : (
        <>
          {activeTab === "dashboard" && <Dashboard products={products} />}
          {activeTab === "products" && (
            <ProductManager products={products} onChange={loadProducts} />
          )}
          {activeTab === "new" && (
            <OrderForm products={products} onCreated={refreshAll} />
          )}
          {activeTab === "history" && (
            <>
              <OrderHistory refreshKey={refreshKey} />
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-wood/10">
                  <label className="block text-sm font-medium text-charcoal/80">
                    Export Date Range (Jakarta)
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-charcoal/60">
                        From
                      </label>
                      <input
                        type="date"
                        value={exportFrom}
                        onChange={(e) => setExportFrom(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-charcoal/60">
                        To
                      </label>
                      <input
                        type="date"
                        value={exportTo}
                        onChange={(e) => setExportTo(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-wood/20 bg-cream px-3 py-2 text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
                      />
                    </div>
                  </div>
                </div>
                <ExportButton
                  from={exportFrom}
                  to={exportTo}
                  label="Export to Excel"
                />
              </div>
            </>
          )}
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-wood/10 bg-white/95 px-4 pb-4 pt-2 backdrop-blur">
        <div className="mx-auto flex max-w-lg justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 flex-col items-center rounded-xl py-2 text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-sage text-white"
                  : "text-charcoal/70 hover:bg-cream-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
