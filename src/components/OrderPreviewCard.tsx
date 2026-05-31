"use client";

import { Order } from "@/types/order";
import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";
const broncoConfig = broncoConfigJson as ProductConfig;
import { getSelectedLayers } from "@/lib/layers";
import BuilderPreview from "@/components/BuilderPreview";
import type { ManeContext } from "@/lib/assets";

const MANE_STYLE_MAP: Record<string, string> = { V4: "reg", V5: "reg" };
const MANE_COLOR_MAP: Record<string, string> = { V6: "black", V7: "white" };

interface OrderPreviewCardProps {
  order: Order;
}

export function OrderPreviewCard({ order }: OrderPreviewCardProps) {
  const firstItem = order.items[0];

  if (!firstItem) return null;

  const buildState = {
    productId: firstItem.productId,
    selectedOptions: firstItem.selectedOptions,
    customFields: firstItem.customFields,
  };

  const layers = getSelectedLayers(broncoConfig, buildState);

  const styleId = firstItem.selectedOptions?.["G2"] as string | undefined;
  const colorId = firstItem.selectedOptions?.["G3"] as string | undefined;
  const style = styleId ? MANE_STYLE_MAP[styleId] : undefined;
  const color = colorId ? MANE_COLOR_MAP[colorId] : undefined;
  const mane: ManeContext | undefined = style && color ? { style, color } : undefined;

  return (
    <BuilderPreview
      layers={layers}
      view="front"
      nameplateText={firstItem.customFields?.nameplateText}
      mane={mane}
    />
  );
}
