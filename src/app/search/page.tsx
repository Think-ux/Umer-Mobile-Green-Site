"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/data/store";
import ProductCard from "@/components/ProductCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.brand,
        product.model,
        product.category,
        product.quality,
        product.slug,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="bg-slate-950 px-4 py-14 text-white">
        <div className="mx-auto max-w-5xl text-center">

          <p className="text-sm font-black uppercase tracking-widest text-orange-400">
            Product Discovery
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            Find the right mobile part
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Search by product name, brand, model, part type or quality.
          </p>

          <div className="mx-auto mt-8 max-w-3xl">
            <div className="flex overflow-hidden rounded-2xl bg-white p-2">

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Try: iPhone 13, Samsung A15, LCD..."
                className="min-w-0 flex-1 px-4 py-3 text-slate-900 outline-none"
              />

              <button
                type="button"
                className="rounded-xl bg-orange-500 px-6 py-3 font-black text-white"
              >
                Search
              </button>

            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">

        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-orange-500">
              Results
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {query
                ? `Search results for "${query}"`
                : "All Products"}
            </h2>
          </div>

          <div className="text-sm font-bold text-slate-500">
            {results.length} products
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-3xl border bg-white px-6 py-20 text-center">
            <div className="text-4xl">?</div>

            <h2 className="mt-5 text-2xl font-black">
              No products found
            </h2>

            <p className="mt-2 text-slate-500">
              Try a different brand, model or part name.
            </p>

            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-black text-white"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12">
        <Link
          href="/"
          className="font-bold text-orange-600"
        >
          ← Back to Home
        </Link>
      </div>

    </main>
  );
}
