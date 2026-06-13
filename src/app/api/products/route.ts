import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, imageUrl } = body;

    if (!name || price == null || price < 0) {
      return NextResponse.json(
        { error: "Name and non-negative price are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: String(name),
        price: Number(price),
        imageUrl: imageUrl != null ? String(imageUrl) : null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Product with this name already exists" },
        { status: 409 }
      );
    }
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
