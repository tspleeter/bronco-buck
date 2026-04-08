import "./globals.css";
import type { ReactNode } from "react";
import SavedBuildsProvider from "@/components/SavedBuildsProvider";
import SiteNav from "@/components/SiteNav";

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