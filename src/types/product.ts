export type OptionType = "single" | "multi";

export interface ProductOption {
  id: string;
  name: string;
  priceDelta: number;
  imageLayer: string;
  layerType: string;
  active: boolean;
}

export interface ProductGroup {
  id: string;
  name: string;
  type: OptionType;
  required: boolean;
  displayOrder: number;
  options: ProductOption[];
}

export interface ProductConfig {
  productId: string;
  slug: string;
  name: string;
  basePrice: number;
  currency: string;
  baseLayer: string;
  layerOrder: string[];
  groups: ProductGroup[];
}
