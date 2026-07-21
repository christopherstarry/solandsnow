export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
}

export interface Order {
  id: string;
  customerName: string;
  customerId: string | null;
  total: number;
  date: string;
  needsInvoice: boolean;
  invoiceSent: boolean;
  createdAt: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  summary: Array<{
    date: string;
    _sum: { total: number | null };
    _count: { id: number };
  }>;
}

export interface OrderInput {
  customerName: string;
  date: string;
  items: { productId: string; quantity: number }[];
  needsInvoice?: boolean;
  customerEmail?: string;
}

export interface ExportResponse {
  rows: Record<string, string | number>[];
  summary: Record<string, string | number>[];
}
