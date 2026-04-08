import { CartItem } from "@/types/cart";

const CART_KEY = "bronco_buddy_cart";

function notifyCartChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  notifyCartChanged();
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
}

export function clearCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_KEY);
  notifyCartChanged();
}