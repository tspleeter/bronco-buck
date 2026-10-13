import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Color Gallery — All 11 Bronco Colors",
  description:
    "See the Bronco Buck in all 11 Bronco-inspired colors, from Cactus Gray to Cyber Orange. Pick one and customize the mane and nameplate.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return children;
}
