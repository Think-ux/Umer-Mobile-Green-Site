"use client";

import Link from "next/link";
import { useCatalog } from "@/components/CatalogProvider";
import BannerCarousel from "@/components/BannerCarousel";

const preparation = [
  "Tell us about your repair shop or parts business.",
  "The store will review your application and follow up.",
  "Confirm wholesale pricing, minimum quantities and payment terms with the team.",
];

const steps = [
  ["01", "Apply", "Submit your shop details and business information."],
  ["02", "Review", "The store reviews your application."],
  ["03", "Confirm", "Agree the pricing and ordering process directly with the store."],
  ["04", "Access", "Approved accounts receive access once account setup is complete."],
];

export default function RetailerPage() {
  const { banners } = useCatalog();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.28),_transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl">
              <div className="text-sm font-black uppercase tracking-[0.24em] text-orange-400">
                Umer Wholesale
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Built for mobile parts retailers.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Repair shops can submit an application to discuss retailer access. Pricing, minimum order quantities, delivery and ordering terms are confirmed directly with the store.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/retailer/register"
                  className="rounded-xl bg-orange-500 px-6 py-4 text-center font-black text-white transition hover:bg-orange-600"
                >
                  Apply for Wholesale
                </Link>

                <Link
                  href="/retailer/login"
                  className="rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-center font-black text-white transition hover:bg-white/10"
                >
                  Retailer Login
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-orange-950/20 backdrop-blur-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Pricing</p>
                  <p className="mt-2 text-xl font-black text-white">Discuss with the store</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Minimum quantities</p>
                  <p className="mt-2 text-xl font-black text-white">Confirm before ordering</p>
                </div>

                <div className="rounded-2xl bg-orange-500 p-4 text-slate-950">
                  <p className="text-sm font-bold">Application review</p>
                  <p className="mt-2 text-2xl font-black">Access is subject to approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BannerCarousel
        label="Retailer promotions"
        banners={banners.filter((banner) => banner.placement === "Retailer page")}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">
            Retailer applications
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Discuss your requirements with our team
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {preparation.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl font-black text-orange-600">
                ✓
              </div>
              <p className="mt-4 text-base font-bold leading-7 text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Application and access process
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {steps.map(([number, title, text]) => (
              <div key={number} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="text-sm font-black text-orange-500">{number}</div>
                <h3 className="mt-3 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-10 text-white shadow-xl shadow-orange-500/25 sm:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-100">
                Grow your business
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Need to discuss retailer access?
              </h2>
            </div>

            <Link
              href="/retailer/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-center font-black text-orange-700 transition hover:bg-slate-100"
            >
              Apply for Wholesale →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
