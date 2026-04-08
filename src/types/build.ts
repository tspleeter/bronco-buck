export interface BuildState {
  productId: string;
  selectedOptions: Record<string, string | string[]>;
  customFields: {
    nameplateText?: string;
  };
}

export interface FeaturedBuild {
  featuredId: string;
  buildName: string;
  slug: string;
  productId: string;
  selectedOptions: Record<string, string | string[]>;
  customFields: {
    nameplateText?: string;
  };
  heroImage: string;
  caption: string;
  featured: boolean;
  buildOfWeek: boolean;
  active: boolean;
}
