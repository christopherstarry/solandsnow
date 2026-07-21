import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");

    let where: Record<string, unknown> = {};
    if (from && to) {
      where = { date: { gte: from, lte: to } };
    } else if (date) {
      where = { date };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const rows: Array<Record<string, string | number>> = [];
    const productAgg: Record<string, { qty: number; revenue: number }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        const productName = item.product.name;
        if (!productAgg[productName]) {
          productAgg[productName] = { qty: 0, revenue: 0 };
        }
        productAgg[productName].qty += item.quantity;
        productAgg[productName].revenue += item.quantity * item.price;

        rows.push({
          Invoice: order.id.slice(0, 8),
          Date: order.date,
          Customer: order.customerName,
          Product: productName,
          Qty: item.quantity,
          Price: item.price,
          Subtotal: item.quantity * item.price,
        });
      }

      rows.push({
        Invoice: order.id.slice(0, 8),
        Date: "",
        Customer: "",
        Product: "TOTAL",
        Qty: "",
        Price: "",
        Subtotal: order.total,
      });
    }

    const grandTotal = orders.reduce((sum, o) => sum + o.total, 0);
    rows.push({
      Invoice: "",
      Date: "",
      Customer: "",
      Product: "GRAND TOTAL",
      Qty: "",
      Price: "",
      Subtotal: grandTotal,
    });

    const summary = Object.entries(productAgg)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([product, data]) => ({
        Product: product,
        "Total Qty": data.qty,
        "Total Revenue": data.revenue,
      }));

    return NextResponse.json({ rows, summary });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
}
