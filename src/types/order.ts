export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Carrier = "usps" | "ups" | "fedex" | "dhl" | "other";

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

/**
 * Gift orders (Oct 2026). The buyer stays in `customer` (name, email, phone —
 * they get the emailed invoice); `customer.address*` is the ship-to address,
 * and the box is addressed to the recipient below. Nothing with prices ever
 * goes in the box: no packing slip, the gift message is the only paper.
 */
export interface OrderGift {
  recipientFirstName: string;
  recipientLastName: string;
  /** Printed on the card in the box. Max GIFT_MESSAGE_MAX chars. */
  message?: string;
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
  /** Dollar discount applied (absent/0 when no code used). */
  discount?: number;
  /** The discount code applied, if any. */
  discountCode?: string;
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

  // Fulfillment / shipping
  carrier?: Carrier;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;

  notes?: string;

  /** Present only on gift orders. */
  gift?: OrderGift;

  /**
   * Admin activity log, oldest first. Appended on every "Save fulfillment",
   * every email (re)send from the admin page, and every customer-info edit.
   * Absent on orders created before Sep 2026.
   */
  history?: OrderEvent[];
}

export type OrderEmailKind = "confirmation" | "shipment";

export interface OrderEmailResult {
  kind: OrderEmailKind;
  to: string;
  sent: boolean;
  error?: string;
}

export interface CustomerFieldChange {
  field: keyof OrderCustomer;
  from: string;
  to: string;
}

export type OrderEvent =
  | {
      id: string;
      at: string;
      type: "fulfillment_saved";
      previousStatus: OrderStatus;
      status: OrderStatus;
      carrier?: Carrier;
      trackingNumber?: string;
      trackingUrl?: string;
      /** Present when the save triggered an automatic email. */
      email?: OrderEmailResult;
    }
  | {
      id: string;
      at: string;
      type: "email_resent";
      /** The history entry whose Resend button was pressed, if any. */
      sourceEventId?: string;
      carrier?: Carrier;
      trackingNumber?: string;
      trackingUrl?: string;
      email: OrderEmailResult;
    }
  | {
      id: string;
      at: string;
      type: "customer_updated";
      changes: CustomerFieldChange[];
    };
