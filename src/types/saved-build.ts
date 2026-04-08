export interface SavedBuild {
  buildId: string;
  buildName: string;
  productId: string;
  productName: string;
  selectedOptions: Record<string, string | string[]>;
  customFields: {
    nameplateText?: string;
  };
  price: number;
  savedAt: string;
}