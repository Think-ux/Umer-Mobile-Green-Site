import type { Metadata } from "next";
import "./globals.css";

import Layout from "@/components/Layout";
import { CartProvider } from "@/components/CartProvider";
import { CatalogProvider } from "@/components/CatalogProvider";

export const metadata: Metadata = {
  title: "Umer Mobile Parts",
  description:
    "Mobile spare parts, displays, batteries, charging parts and wholesale supplies across Pakistan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CatalogProvider>
          <CartProvider>
            <Layout>{children}</Layout>
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
