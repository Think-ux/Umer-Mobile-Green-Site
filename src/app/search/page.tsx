"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/components/CatalogProvider";
import ProductCard from "@/components/ProductCard";

const quickSearches = [
  "iPhone 13",
  "Samsung A15",
  "Battery",
  "LCD",
  "Camera",
];

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">Loading products…</main>}>
      <SearchResults />
    </Suspense>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  return <SearchContent key={searchParams.get("q") ?? ""} initialQuery={searchParams.get("q") ?? ""} />;
}

function SearchContent({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("featured");
  const { products } = useCatalog();

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [products]
  );
  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand))],
    [products]
  );
  const models = useMemo(
    () => [
      ...new Set(
        products
          .filter((product) => selectedBrand === "all" || product.brand === selectedBrand)
          .map((product) => product.model)
      ),
    ],
    [products, selectedBrand]
  );

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    let filtered = products.filter((product) => {
      const matchesQuery =
        !value ||
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
        .includes(value);

      return (
        matchesQuery &&
        (selectedCategory === "all" || product.category === selectedCategory) &&
        (selectedBrand === "all" || product.brand === selectedBrand) &&
        (selectedModel === "all" || product.model === selectedModel) &&
        (availability === "all" ||
          (availability === "in-stock" && product.stock > 0) ||
          (availability === "out-of-stock" && product.stock <= 0))
      );
    });

    if (sort === "price-low") filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-high") filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [query, products, selectedCategory, selectedBrand, selectedModel, availability, sort]);

  function resetFilters() {
    setQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedModel("all");
    setAvailability("all");
    setSort("featured");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-slate-950 px-4 py-14 text-white sm:py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-black uppercase tracking-eyebrow-prominent text-lime-300">
            Product Discovery
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
            Find the right mobile part
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            Search by brand, model, category or repair need and compare quality before ordering.
          </p>

          <form action="/search" method="GET" role="search" className="mx-auto mt-8 max-w-4xl">
            <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white p-2 shadow-xl shadow-lime-950/20">
              <input
                name="q"
                aria-label="Search by product, brand or model"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try: iPhone 13, Samsung A15, LCD..."
                className="min-w-0 flex-1 px-4 py-3.5 text-slate-900 outline-none"
              />

              <button
                type="submit"
                className="rounded-xl bg-brand-primary px-6 py-3 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mx-auto mt-5 max-w-4xl">
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {quickSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-lime-300 hover:text-lime-300"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-eyebrow text-lime-700">
              Results
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {query ? `Search results for "${query}"` : "All Products"}
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
            <span className="text-lime-700">{results.length}</span>
            products found
          </div>
        </div>

        <section aria-label="Filter search results" className="ui-card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-bold text-slate-600">
            Category
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="ui-field mt-1 text-sm">
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Brand
            <select value={selectedBrand} onChange={(event) => { setSelectedBrand(event.target.value); setSelectedModel("all"); }} className="ui-field mt-1 text-sm">
              <option value="all">All brands</option>
              {brands.map((brand) => <option key={brand}>{brand}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Compatible model
            <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} className="ui-field mt-1 text-sm">
              <option value="all">All models</option>
              {models.map((model) => <option key={model}>{model}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Availability
            <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="ui-field mt-1 text-sm">
              <option value="all">All availability</option>
              <option value="in-stock">In stock</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="ui-field mt-1 text-sm">
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </section>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lime-50 text-4xl text-lime-700">
              ⌕
            </div>

            <h2 className="mt-6 text-2xl font-black">No products found</h2>

            <p className="mt-2 text-slate-500">
              Try a different brand, model or part name to find the right match.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-brand-primary px-6 py-3 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-lime-700 transition hover:text-lime-800">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
