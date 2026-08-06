"use client";

import { Order, OrderItem } from "@/types/order";
import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";
const broncoConfig = broncoConfigJson as ProductConfig;
import { getSelectedLayers } from "@/lib/layers";
import BuilderPreview from "@/components/BuilderPreview";
import { getManeContext } from "@/lib/mane";

// Renders the front-view mockup for a single order line item.
// Mane style/color is derived via the canonical getManeContext(), which always
// returns a valid mane (never undefined) and handles Long (V28) with the
// LONG_SUPPORTED_G1 fallback — so the body render never 404s into a blank card.
export function OrderItemPreview({ item }: { item: OrderItem }) {
  const buildState = {
    productId: item.productId,
    selectedOptions: item.selectedOptions,
    customFields: item.customFields,
  };

  const layers = getSelectedLayers(broncoConfig, buildState);
  const mane = getManeContext(item.selectedOptions);

  return (
    <BuilderPreview
      layers={layers}
      view="front"
      nameplateText={item.customFields?.nameplateText}
      mane={mane}
    />
  );
}

interface OrderPreviewCardProps {
  order: Order;
}

export function OrderPreviewCard({ order }: OrderPreviewCardProps) {
  const firstItem = order.items[0];

  if (!firstItem) return null;

  return <OrderItemPreview item={firstItem} />;
}
