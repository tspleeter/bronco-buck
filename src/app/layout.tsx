import "./globals.css";
import type { ReactNode } from "react";
import SavedBuildsProvider from "@/components/SavedBuildsProvider";
import SiteNav from "@/components/SiteNav";

export const metadata = {
  title: "Bronco Buck — Custom Plush Builder",
  description: "Design your perfect Bronco Buck plush. Customize every detail — body, mane, stand, accessories and more. Share your build or add it to your cart.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SavedBuildsProvider>
          <SiteNav />
          {children}
        </SavedBuildsProvider>
      </body>
    </html>
  );
}