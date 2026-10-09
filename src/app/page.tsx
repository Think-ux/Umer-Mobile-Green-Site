"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { products, categories } from "@/data/store";
import ProductCard from "@/components/ProductCard";

const brands = ["Apple", "Samsung", "Xiaomi", "Oppo", "Vivo", "Realme"];

const categoryIcons: Record<string, string> = {
  Displays: "▣",
  Batteries: "▰",
  "Charging Parts": "ϟ",
  "Camera Parts": "◎",
  Housing: "▤",
  Flex: "⌁",
};

export default function HomePage() {
  const [search, setSearch] = useState("");

  const featuredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];

    if (!search.trim()) {
      return list.slice(0, 8);
    }

    const query = search.toLowerCase().trim();

    return list
      .filter((product) =>
        [
          product.name,
          product.brand,
          product.model,
          product.category,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          )
      )
      .slice(0, 8);
  }, [search]);

  const categoryList = Array.isArray(categories)
    ? categories
    : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Announcement */}
      <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Umer Mobile Parts — Your Mobile Repair Parts Store
      </div>

      {/* Hero */}
      <section className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
              Mobile Spare Parts
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find Quality
              <span className="block text-orange-600">
                Mobile Spare Parts
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Displays, batteries, charging parts and other
              mobile spare parts — explore our catalog to find
              the part that matches your device.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
              >
                Shop Parts
                <span className="ml-2" aria-hidden="true">→</span>
              </Link>

              <a
                href="#categories"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-800 transition hover:border-orange-300 hover:text-orange-600"
              >
                Explore Categories
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <span>✓ Easy product discovery</span>
              <span>✓ Model-focused browsing</span>
              <span>✓ Customer support</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-full bg-orange-200/40 blur-3xl" />

            <div className="relative rounded-3xl border border-white bg-white/80 p-5 shadow-2xl shadow-orange-900/10 backdrop-blur sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Explore the catalog
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Parts for your device
                  </h2>
                </div>

                <span className="rounded-2xl bg-orange-100 p-3 text-2xl text-orange-600" aria-hidden="true">
                  ⚙
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { name: "Displays", icon: "▣" },
                  { name: "Batteries", icon: "▰" },
                  { name: "Charging Parts", icon: "ϟ" },
                  { name: "Camera Parts", icon: "◎" },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href="/search"
                    className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-2xl text-orange-600">
                      {item.icon}
                    </span>
                    <p className="mt-3 text-sm font-bold">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Explore parts →
                    </p>
                  </Link>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-300">
                  For retailers and repair shops
                </p>
                <p className="mt-1 text-xl font-bold">
                  Looking for wholesale?
                </p>
                <Link
                  href="/retailer"
                  className="mt-4 inline-flex items-center font-bold text-orange-400 hover:text-orange-300"
                >
                  Explore retailer options →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <form
          action="/search"
          method="GET"
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row"
        >
          <label htmlFor="homepage-search" className="sr-only">
            Search mobile spare parts
          </label>

          <input
            id="homepage-search"
            name="q"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by part, brand or mobile model..."
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-transparent px-4 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />

          <button
            type="submit"
            className="min-h-12 rounded-xl bg-orange-500 px-7 font-bold text-white transition hover:bg-orange-600"
          >
            Search Parts
          </button>
        </form>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Browse by category
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Find the spare part you need with a simpler
              category-based shopping experience.
            </p>
          </div>

          <Link
            href="/search"
            className="font-bold text-orange-600 hover:text-orange-700"
          >
            View all parts →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categoryList.slice(0, 6).map((category, index) => {
            const name =
              typeof category === "string"
                ? category
                : String(
                    (category as { name?: string }).name ?? ""
                  );

            const slug = name
              .toLowerCase()
              .trim()
              .replace(/&/g, "and")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");

            return (
              <Link
                key={name || index}
                href={`/shop/${encodeURIComponent(slug)}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl font-bold text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                  {categoryIcons[name] ?? "▣"}
                </span>

                <h3 className="mt-4 font-bold">
                  {name || "Mobile Parts"}
                </h3>

                <p className="mt-2 text-xs font-medium text-slate-500">
                  Browse products →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Brands */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Find compatible parts
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Shop by Mobile Brand
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/search?q=${encodeURIComponent(brand)}`}
                className="flex min-h-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                {brand}
              </Link>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Availability and model compatibility should be
            confirmed against the actual product listing.
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Explore our catalog
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {search.trim() ? "Matching Products" : "Featured Products"}
            </h2>
            <p className="mt-3 text-slate-600">
              {search.trim()
                ? `Results for "${search}"`
                : "Browse products listed in our current catalog."}
            </p>
          </div>

          {!search.trim() && (
            <Link
              href="/search"
              className="font-bold text-orange-600 hover:text-orange-700"
            >
              View all products →
            </Link>
          )}
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <span className="text-4xl" aria-hidden="true">⌕</span>
            <h3 className="mt-3 text-xl font-bold">
              No matching products found
            </h3>
            <p className="mt-2 text-slate-600">
              Try another product name, brand or model.
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* Retailer CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                For retailers
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Buying for Your Repair Shop?
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                Explore retailer options or contact our team
                to discuss your mobile spare parts requirements.
              </p>
            </div>

            <Link
              href="/retailer"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Wholesale Inquiry →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust / Support */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl text-orange-600">
              ✓
            </span>
            <div>
              <h3 className="font-bold">Clear Product Details</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Review product information and compatibility before ordering.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl text-orange-600">
              ⌕
            </span>
            <div>
              <h3 className="font-bold">Easy Product Discovery</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Search the catalog by part name, brand or model.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl text-orange-600">
              ☎
            </span>
            <div>
              <h3 className="font-bold">Customer Support</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Visit our customer care page for available support options.
              </p>
              <Link
                href="/customer-care"
                className="mt-2 inline-block text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                Contact us →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

