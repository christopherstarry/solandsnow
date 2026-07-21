"use client";

import { useState } from "react";
import { exportOrders } from "@/lib/api";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  from: string;
  to: string;
  label?: string;
}

export default function ExportButton({ from, to, label = "Export Excel" }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { rows, summary } = await exportOrders(from, to);
      const workbook = XLSX.utils.book_new();

      const ordersSheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, ordersSheet, "All Orders");

      const summarySheet = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Sales Summary");

      const fileName = `solandsnow-orders-${from}_to_${to}.xlsx`;
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
