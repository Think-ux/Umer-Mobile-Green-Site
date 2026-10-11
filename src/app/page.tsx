"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useCatalog } from "@/components/CatalogProvider";
import ProductCard from "@/components/ProductCard";
import { categorySlug } from "@/data/store";

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
  const { products, categories, brands: catalogBrands, reviews, homepage, banners } = useCatalog();
  const brands = useMemo(
    () => catalogBrands.length
      ? catalogBrands.map((brand) => brand.name)
      : [...new Set(products.map((product) => product.brand))],
    [catalogBrands, products]
  );

  const featuredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products.filter((product) => product.is_featured) : [];
    if (!search.trim()) return list.slice(0, 8);

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
  }, [search, products]);

  const categoryList = Array.isArray(categories)
    ? categories
    : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
              {homepage.eyebrow}
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {homepage.headline.split(" ")[0]}
              <span className="block text-orange-600">
                {homepage.headline.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              {homepage.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={homepage.button_href}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
              >
                {homepage.button_label}
                <span className="ml-2" aria-hidden="true">→</span>
              </Link>

              <a
                href="#categories"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-800 transition hover:border-orange-300 hover:text-orange-600"
              >
                Explore Categories
              </a>
            </div>

            {homepage.hero_highlights.filter((highlight) => highlight.trim()).length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
                {homepage.hero_highlights.filter((highlight) => highlight.trim()).map((highlight, index) => (
                  <li key={`${index}-${highlight}`}>✓ {highlight}</li>
                ))}
              </ul>
            )}
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
                {categoryList.slice(0, 4).map((item) => (
                  <Link
                    key={item.name}
                    href={`/shop/${categorySlug(item.name)}`}
                    className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-2xl text-orange-600">
                      {item.icon || "▣"}
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

              {products[0] && (
                <div className="relative mt-5 h-40 overflow-hidden rounded-2xl bg-slate-100 sm:h-52">
                  <Image
                    src={products[0].image}
                    alt={products[0].name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                  <p className="absolute bottom-4 left-4 right-4 font-bold text-white">
                    {products[0].name}
                  </p>
                </div>
              )}

              {homepage.show_retailer_cta && (
                <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                  <p className="text-sm text-slate-300">{homepage.retailer_description}</p>
                  <p className="mt-1 text-xl font-bold">{homepage.retailer_heading}</p>
                  <Link
                    href="/retailer"
                    className="mt-4 inline-flex items-center font-bold text-orange-400 hover:text-orange-300"
                  >
                    {homepage.retailer_button_label} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {banners.filter((banner) => banner.placement === "Homepage").map((banner) => (
        <section key={banner.id} className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link
            href={banner.link_url || "/search"}
            className="group relative flex min-h-48 items-end overflow-hidden rounded-3xl bg-slate-950 bg-cover bg-center p-6 sm:min-h-64 sm:p-10"
            style={{ backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.88), rgba(15,23,42,.1)), url("${banner.image_url}")` }}
          >
            <span className="text-2xl font-black text-white transition group-hover:text-orange-200 sm:text-3xl">
              {banner.title}
            </span>
          </Link>
        </section>
      ))}

      {/* Categories */}
      {homepage.show_categories && <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Browse by category
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {homepage.category_heading}
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              {homepage.category_description}
            </p>
          </div>

          <Link
            href="/search"
            className="font-bold text-orange-600 hover:text-orange-700"
          >
            View all parts →
          </Link>
        </div>

        {categoryList.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categoryList.map((category) => {
              const name = category.name;
              return (
                <Link
                  key={name}
                  href={`/shop/${categorySlug(name)}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5"
              >
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 text-3xl font-bold text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                  {category.icon_image_url ? (
                    <img src={category.icon_image_url} alt="" className="h-full w-full object-cover" />
                  ) : category.icon || categoryIcons[name] || "▣"}
                </span>

                <h3 className="mt-4 font-bold">
                  {name || "Mobile Parts"}
                </h3>

                <p className="mt-2 text-xs font-medium text-slate-500">
                  {category.count} {category.count === 1 ? "product" : "products"} →
                </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No visible categories are available yet. Browse the full product list instead.
            <Link href="/search" className="ml-1 font-bold text-orange-600 hover:text-orange-700">
              Browse products →
            </Link>
          </p>
        )}
      </section>}

      {/* Brands */}
      {homepage.show_brands && <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Find compatible parts
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {homepage.brand_heading}
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
            {homepage.brand_description}
          </p>
        </div>
      </section>}

      {homepage.show_featured && <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">
              Explore our catalog
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {search.trim() ? "Matching Products" : homepage.featured_heading}
            </h2>
            <p className="mt-3 text-slate-600">
              {search.trim()
                ? `Results for "${search}"`
                : "Hand-picked parts from our current catalog."}
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
              {search.trim() ? "No matching products found" : "No featured products yet"}
            </h3>
            <p className="mt-2 text-slate-600">
              {search.trim() ? "Try another product name, brand or model." : "Mark products as featured in CMS Products to show them here."}
            </p>
            {search.trim() && <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
            >
              Clear Search
            </button>}
          </div>
        )}
      </section>}

      {homepage.show_products && <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-orange-600">Browse the catalog</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{homepage.products_heading}</h2>
            </div>
            <Link href="/search" className="font-bold text-orange-600 hover:text-orange-700">View all products →</Link>
          </div>
          {products.some((product) => !product.is_featured) ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.filter((product) => !product.is_featured).slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No other products are available yet.</p>
          )}
        </div>
      </section>}

      {homepage.show_reviews && reviews.length > 0 && <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-600">Customer feedback</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">{homepage.reviews_heading}</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-amber-500" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{review.review_text}</p>
              <p className="mt-4 font-bold text-slate-900">{review.reviewer_name}</p>
              <p className="mt-1 text-xs text-slate-500">{review.product_name}</p>
            </article>
          ))}
        </div>
      </section>}

      {/* Retailer CTA */}
      {homepage.show_retailer_cta && <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-400">
                For retailers
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                {homepage.retailer_heading}
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                {homepage.retailer_description}
              </p>
            </div>

            <Link
              href="/retailer"
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              {homepage.retailer_button_label} →
            </Link>
          </div>
        </div>
      </section>}

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
