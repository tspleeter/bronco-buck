import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Gift a Bronco Buck",
  description:
    "Give a Bronco Buck gift code. They pick their Bronco color, mane and nameplate. Code emailed to you instantly.",
  alternates: { canonical: "/gift-card" },
  openGraph: pageOpenGraph("/gift-card", "Gift a Bronco Buck"),
};

export default function GiftCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
