export interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  selectedOptions: Record<string, string | string[]>;
  customFields: {
    nameplateText?: string;
  };
  price: number;
  quantity: number;
  addedAt: string;
}