"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
