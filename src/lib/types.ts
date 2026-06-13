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

export interface Order {
  id: string;
  customerName: string;
  total: number;
  date: string;
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
}
