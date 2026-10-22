import type { ReactNode } from "react";
import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";

// The homepage is a client component and can't export metadata, so its
// self-referencing canonical lives in this route-group layout instead.
// "(home)" adds no URL segment — this still serves "/".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph("/"),
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return children;
}
