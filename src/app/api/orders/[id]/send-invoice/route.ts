import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

function invoiceHtml(order: {
  id: string;
  customerName: string;
  date: string;
  total: number;
  items: Array<{
    quantity: number;
    price: number;
    product: { name: string };
  }>;
}) {
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e5e0d8;">${item.product.name} x${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #e5e0d8;text-align:right;">${formatRupiah(item.price * item.quantity)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#faf8f5;padding:20px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <h1 style="margin:0 0 4px;font-size:22px;color:#3b2f2f;">Sol & Snow</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#6b5e5e;">Dog Snack Invoice</p>

    <table style="width:100%;font-size:14px;color:#3b2f2f;">
      <tr>
        <td style="padding:4px 0;color:#6b5e5e;">Invoice</td>
        <td style="padding:4px 0;text-align:right;font-weight:600;">#${order.id.slice(0, 8)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6b5e5e;">Date</td>
        <td style="padding:4px 0;text-align:right;">${order.date}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6b5e5e;">Customer</td>
        <td style="padding:4px 0;text-align:right;">${order.customerName}</td>
      </tr>
    </table>

    <table style="width:100%;font-size:14px;color:#3b2f2f;margin-top:20px;">
      ${itemsRows}
    </table>

    <table style="width:100%;font-size:16px;color:#3b2f2f;margin-top:12px;">
      <tr>
        <td style="font-weight:700;">Total</td>
        <td style="text-align:right;font-weight:700;">${formatRupiah(order.total)}</td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:12px;color:#a0938a;text-align:center;">
      Thank you for your order! &mdash; Sol & Snow
    </p>
  </div>
</body>
</html>`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: "Sol & Snow <onboarding@resend.dev>",
      to: [email],
      subject: `Invoice #${order.id.slice(0, 8)} - Sol & Snow`,
      html: invoiceHtml(order),
    });

    if (error) {
      console.error("Resend send error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    await prisma.order.update({
      where: { id: params.id },
      data: { invoiceSent: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/orders/[id]/send-invoice error:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 }
    );
  }
}
