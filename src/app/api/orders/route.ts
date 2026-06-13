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
      orderBy: { createdAt: "desc" },
    });

    const summary = await prisma.order.groupBy({
      by: ["date"],
      where,
      _sum: { total: true },
      _count: { id: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ orders, summary });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, date, items } = body;

    if (!customerName || !date || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "customerName, date, and items (non-empty array) are required" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: "Each item must have productId and quantity >= 1" },
          { status: 400 }
        );
      }
    }

    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product with id ${item.productId} not found` },
          { status: 400 }
        );
      }
      const lineTotal = product.price * item.quantity;
      total += lineTotal;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        customerName: String(customerName),
        date: String(date),
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
