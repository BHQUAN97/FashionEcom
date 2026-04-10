/** Don hang va thanh toan */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'cod' | 'bank_transfer';

export interface OrderItem {
  id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_district: string;
  shipping_ward: string;
  note: string;
  created_at: string;
  updated_at: string;
  timeline: OrderTimelineItem[];
}

export interface OrderTimelineItem {
  status: OrderStatus;
  note: string;
  created_at: string;
}
