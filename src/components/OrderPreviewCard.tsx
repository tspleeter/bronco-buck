"use client";

import { Order } from "@/types/order";
import broncoConfig from "@/data/bronco-config.json";
import { getSelectedLayers } from "@/lib/layers";
import BuilderPreview from "@/components/BuilderPreview";

interface OrderPreviewCardProps {
  order: Order;
}

export function OrderPreviewCard({ order }: OrderPreviewCardProps) {
  const firstItem = order.items[0];

  if (!firstItem) return null;

  const layers = getSelectedLayers(broncoConfig, {
    productId: firstItem.productId,
    selectedOptions: firstItem.selectedOptions,
    customFields: firstItem.customFields,
  });

  return (
    <BuilderPreview
      layers={layers}
      view="front"
      nameplateText={firstItem.customFields?.nameplateText}
    />
  );
}