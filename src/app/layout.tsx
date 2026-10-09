import type { Metadata } from "next";
import "./globals.css";

import Layout from "@/components/Layout";
import { CartProvider } from "@/components/CartProvider";

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
        <CartProvider>
          <Layout>
            {children}
          </Layout>
        </CartProvider>
      </body>
    </html>
  );
}
