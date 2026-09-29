export interface BuildState {
  productId: string;
  selectedOptions: Record<string, string | string[]>;
  customFields: {
    nameplateText?: string;
  };
}

