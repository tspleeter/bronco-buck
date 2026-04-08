import { Order } from "@/types/order";

const ORDERS_KEY = "bronco_buddy_orders";
const LAST_ORDER_KEY = "bronco_buddy_last_order";

/**
 * Notify app that orders changed (for UI updates)
 */
function notifyOrdersChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("orders-updated"));
}

/**
 * Get all orders
 */
export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

/**
 * Get a single order by ID
 */
export function getOrderById(orderId: string): Order | undefined {
  const orders = getOrders();
  return orders.find((order) => order.orderId === orderId);
}

/**
 * Persist orders list
 */
export function saveOrders(items: Order[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(items));
  notifyOrdersChanged();
}

/**
 * Create a new order
 */
export function createOrder(order: Order) {
  const orders = getOrders();
  const next = [order, ...orders];

  saveOrders(next);
  setLastOrder(order);
}

/**
 * Update an existing order
 */
export function updateOrder(updatedOrder: Order) {
  const orders = getOrders();

  const next = orders.map((order) =>
    order.orderId === updatedOrder.orderId ? updatedOrder : order
  );

  saveOrders(next);

  // Keep last order in sync
  const lastOrder = getLastOrder();
  if (lastOrder?.orderId === updatedOrder.orderId) {
    setLastOrder(updatedOrder);
  }
}

/**
 * Remove an order
 */
export function removeOrder(orderId: string) {
  const orders = getOrders();
  const next = orders.filter((order) => order.orderId !== orderId);

  saveOrders(next);

  // Clear last order if needed
  const lastOrder = getLastOrder();
  if (lastOrder?.orderId === orderId) {
    clearLastOrder();
  }
}

/**
 * Clear all orders
 */
export function clearOrders() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ORDERS_KEY);
  clearLastOrder();
  notifyOrdersChanged();
}

/**
 * Store last order (used for confirmation page)
 */
export function setLastOrder(order: Order) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
}

/**
 * Get last placed order
 */
export function getLastOrder(): Order | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

/**
 * Clear last order reference
 */
export function clearLastOrder() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(LAST_ORDER_KEY);
}