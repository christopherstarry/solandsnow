import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const where = date ? { date } : {};

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

    for (const order of orders) {
      for (const item of order.items) {
        rows.push({
          Invoice: order.id.slice(0, 8),
          Date: order.date,
          Customer: order.customerName,
          Product: item.product.name,
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

    return NextResponse.json({ orders, rows });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
}
