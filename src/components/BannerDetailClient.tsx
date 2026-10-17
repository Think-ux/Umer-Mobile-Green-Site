"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCatalog } from "@/components/CatalogProvider";

export default function BannerDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { banners, status, error } = useCatalog();
  const bannerId = Number(id);
  const banner = Number.isSafeInteger(bannerId)
    ? banners.find((item) => item.id === bannerId)
    : undefined;

  if (banner) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-lime-700"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </Link>

          <div
            role="img"
            aria-label={banner.title}
            className="mt-6 aspect-banner-card-mobile min-h-64 rounded-2xl bg-slate-950 bg-contain bg-center bg-no-repeat shadow-xl sm:aspect-banner-card-tablet lg:aspect-banner-card-desktop"
            style={{ backgroundImage: `url("${banner.image_url}")` }}
          />

          <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">
                Campaign
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {banner.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              {banner.link_url && (
                <Link
                  href={banner.link_url}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-primary px-5 py-3 font-bold text-brand-primary-foreground transition hover:bg-brand-primary-hover"
                >
                  View campaign offer
                  <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              )}
              <Link
                href="/search"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-800 transition hover:border-lime-300 hover:text-lime-700"
              >
                Browse products
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">
        Loading banner…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-black">Banner not found</h1>
      <p className="mt-3 text-slate-500">
        {status === "error"
          ? `The live banners could not be loaded. ${error}`
          : "This banner may have been removed or is no longer published."}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-brand-primary px-5 py-3 font-black text-brand-primary-foreground"
      >
        Return home
      </Link>
    </main>
  );
}
