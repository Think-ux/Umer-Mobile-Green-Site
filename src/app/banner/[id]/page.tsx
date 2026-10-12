"use client";

import { Suspense } from "react";
import BannerDetailClient from "@/components/BannerDetailClient";

export default function BannerPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">Loading banner…</main>}>
      <BannerDetailClient />
    </Suspense>
  );
}
