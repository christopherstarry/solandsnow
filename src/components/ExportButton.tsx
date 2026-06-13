"use client";

import { useState } from "react";
import { exportOrders } from "@/lib/api";
import { toJakartaDateString } from "@/lib/utils";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  date?: string;
  label?: string;
}

export default function ExportButton({ date, label = "Export Excel" }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { rows } = await exportOrders(date);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
      const fileName = `solandsnow-orders-${date ?? toJakartaDateString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="w-full rounded-2xl bg-wood py-3 text-sm font-bold text-white shadow-sm active:bg-wood-dark disabled:opacity-60"
    >
      {loading ? "Exporting..." : label}
    </button>
  );
}
