export interface SharedBuild {
  shareId: string;
  buildName: string;
  productId: string;
  productSlug: string;
  productName: string;
  selectedOptions: Record<string, string | string[]>;
  customFields: {
    nameplateText?: string;
  };
  price: number;
  createdAt: string;
  isFeatured?: boolean;
}