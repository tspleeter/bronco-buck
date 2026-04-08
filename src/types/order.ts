export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface OrderItem {
  cartItemId: string;

  productId: string;
  productName: string;

  selectedOptions: Record<string, string | string[]>;
  customFields: Record<string, any>;

  price: number;
  quantity: number;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
}

export interface Order {
  orderId: string;

  status: OrderStatus;

  customer: OrderCustomer;
  items: OrderItem[];

  pricing: OrderPricing;

  createdAt: string;
  updatedAt: string;

  notes?: string;
}