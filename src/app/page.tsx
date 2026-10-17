"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import heroImage from "./images/hero.png";
import { useCatalog } from "@/components/CatalogProvider";
import ProductCard from "@/components/ProductCard";
import { Card } from "@/components/ui";
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
  const { products, categories, brands: catalogBrands, homepage } = useCatalog();
  const brands = catalogBrands.length
    ? catalogBrands.map((brand) => brand.name)
    : [...new Set(products.map((product) => product.brand))];
  const featuredProducts = products.filter((product) => product.is_featured).slice(0, 3);
  const categoryList = Array.isArray(categories)
    ? categories
    : [];

  return (
    <main className="min-h-screen bg-canvas text-content-primary">
      {/* Hero */}
      <section className="relative isolate flex min-h-hero items-center overflow-hidden bg-market-950 sm:min-h-hero-lg">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt=""
            fill
            sizes="100vw"
            fetchPriority="high"
            className="hero-image-drift object-cover object-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-market-950 via-market-950/85 to-market-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-market-950/45 via-transparent to-market-950/20" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-home-hero lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <span className="type-overline hero-enter inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-lime-300 shadow-lg shadow-black/10 backdrop-blur">
              {homepage.eyebrow}
            </span>

            <h1 className="type-display hero-enter hero-enter-delay-1 mt-6 max-w-3xl text-white">
              {homepage.headline}
            </h1>

            <p className="type-body hero-enter hero-enter-delay-2 mt-6 max-w-prose leading-relaxed text-white/80 sm:text-lg">
              {homepage.description}
            </p>

            <div className="hero-enter hero-enter-delay-3 mt-8 flex flex-wrap gap-3">
              <Link
                href={homepage.button_href}
                className="ui-button ui-button--primary ui-button--lg shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
              >
                {homepage.button_label}
                <span className="ml-2" aria-hidden="true">→</span>
              </Link>

              <a
                href="#categories"
                className="ui-button ui-button--inverse ui-button--lg"
              >
                Explore Categories
              </a>
            </div>

            {homepage.hero_highlights.filter((highlight) => highlight.trim()).length > 0 && (
              <ul className="hero-enter hero-enter-delay-3 mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/80">
                {homepage.hero_highlights.filter((highlight) => highlight.trim()).map((highlight, index) => (
                  <li key={`${index}-${highlight}`}>
                    <span className="mr-1.5 text-lime-300" aria-hidden="true">✓</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {categoryList.length > 0 && (
            <nav
              aria-label="Shop parts by category"
              className="hero-enter hero-enter-delay-2 hidden self-center border-l border-lime-400/60 pl-6 lg:block"
            >
              <p className="type-overline mb-4 text-lime-300">Shop parts</p>
              <ul className="space-y-2">
                {categoryList.slice(0, 7).map((category) => (
                  <li key={category.name}>
                    <Link
                      href={`/shop/${categorySlug(category.name)}`}
                      className="group flex items-center justify-between gap-5 py-1 text-sm font-bold uppercase tracking-wide text-white/90 transition hover:text-lime-300"
                    >
                      {category.name}
                      <span aria-hidden="true" className="text-lime-300 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <section aria-label="Store benefits" className="border-y border-market-800 bg-market-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime-400/10 text-lime-300" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 19 6v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <div>
              <h2 className="font-bold">Product Details</h2>
              <p className="mt-1 text-sm text-slate-300">Review listed quality and model details.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime-400/10 text-lime-300" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v11H3zM14 11h4l3 3v4h-7z" />
                <circle cx="7.5" cy="19" r="1.5" />
                <circle cx="17.5" cy="19" r="1.5" />
              </svg>
            </span>
            <div>
              <h2 className="font-bold">
                <Link href="/shipping-policy" className="transition hover:text-lime-300">Delivery Options →</Link>
              </h2>
              <p className="mt-1 text-sm text-slate-300">Check available delivery rates at checkout.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime-400/10 text-lime-300" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V5h16v3M7 8v11h10V8M4 12h16M10 15h4" />
              </svg>
            </span>
            <div>
              <h2 className="font-bold">
                <Link href="/retailer" className="transition hover:text-lime-300">Retailer Pricing →</Link>
              </h2>
              <p className="mt-1 text-sm text-slate-300">Wholesale prices for approved retailer accounts.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime-400/10 text-lime-300" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 13v-2a8 8 0 0 1 16 0v2M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2Zm16 0h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 19a5 5 0 0 1-5 3" />
              </svg>
            </span>
            <div>
              <h2 className="font-bold">
                <Link href="/customer-care" className="transition hover:text-lime-300">Customer Support →</Link>
              </h2>
              <p className="mt-1 text-sm text-slate-300">Find contact options and order assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {homepage.show_categories && <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-overline text-brand-primary">
              Browse by category
            </p>
            <h2 className="type-heading mt-2 sm:text-4xl">
              {homepage.category_heading}
            </h2>
            <p className="type-body mt-3 max-w-prose text-content-secondary">
              {homepage.category_description}
            </p>
          </div>

          <Link
            href="/search"
            className="font-bold text-brand-primary hover:text-brand-primary-hover"
          >
            View all parts →
          </Link>
        </div>

        {categoryList.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categoryList.map((category) => {
              const name = category.name;
              const categoryImages = [
                category.icon_image_url,
                ...products
                  .filter((product) => product.category === name)
                  .map((product) => product.image),
              ].filter((image): image is string => Boolean(image));

              return (
                <Card
                  as="article"
                  key={name}
                  className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-brand-primary hover:shadow-lg"
                >
                  <Link
                    href={`/shop/${categorySlug(name)}`}
                    className="block h-full"
                  >
                    <CategoryArtwork
                      images={categoryImages}
                      icon={category.icon || categoryIcons[name] || "▣"}
                    />
                    <span className="flex items-center justify-between gap-2 px-4 py-3">
                      <span className="font-bold">{name || "Mobile Parts"}</span>
                      <span aria-hidden="true" className="text-content-secondary transition group-hover:translate-x-1 group-hover:text-brand-primary">→</span>
                    </span>
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="ui-card mt-8 border-dashed p-8 text-center text-sm text-content-secondary">
            No visible categories are available yet. Browse the full product list instead.
            <Link href="/search" className="ml-1 font-bold text-brand-primary hover:text-brand-primary-hover">
              Browse products →
            </Link>
          </p>
        )}
      </section>}

      {/* Brands */}
      {homepage.show_brands && <section id="brands" className="border-y border-border-default bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="type-overline text-brand-primary">
              Popular brands
            </p>
            <h2 className="type-heading mt-2">
              {homepage.brand_heading}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`/search?q=${encodeURIComponent(brand)}`}
                className="ui-card flex min-h-14 items-center justify-center px-4 py-3 font-bold text-content-primary transition hover:border-brand-primary hover:bg-lime-50"
              >
                {brand}
              </Link>
            ))}
          </div>

          <p className="type-caption mt-4 text-center">
            {homepage.brand_description}
          </p>
        </div>
      </section>}

      {homepage.show_featured && <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-overline text-brand-primary">
              Popular picks
            </p>
            <h2 className="type-heading mt-2 sm:text-4xl">
              {homepage.featured_heading}
            </h2>
          </div>

          <Link
            href="/search"
            className="font-bold text-brand-primary hover:text-brand-primary-hover"
          >
            View all products →
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="ui-card mt-8 border-dashed px-5 py-14 text-center">
            <span className="text-4xl text-brand-primary" aria-hidden="true">⌕</span>
            <h3 className="mt-3 text-xl font-bold">
              No featured products yet
            </h3>
            <p className="mt-2 text-slate-600">
              Browse the full catalog to see available mobile parts.
            </p>
            <Link href="/search" className="ui-button ui-button--primary mt-5">
              Browse products
            </Link>
          </div>
        )}
      </section>}

      {homepage.show_retailer_cta && <section className="border-y border-lime-300 bg-brand-primary">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="flex items-center gap-4">
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-950/10 text-3xl md:grid" aria-hidden="true">⌂</span>
            <div>
              <p className="type-overline text-market-950">Retailers &amp; Repair Shops</p>
              <h2 className="type-heading mt-2 text-slate-950">
                {homepage.retailer_heading}
              </h2>
              <p className="mt-2 text-sm text-slate-800 sm:text-base">
                {homepage.retailer_description}
              </p>
            </div>
          </div>

          <Link
            href="/retailer"
            className="ui-button ui-button--contrast ui-button--lg shrink-0"
          >
            {homepage.retailer_button_label} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>}
    </main>
  );
}

function CategoryArtwork({
  images,
  icon,
}: {
  images: string[];
  icon: string;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const image = images[imageIndex];
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = imageRef.current;
    if (image && element?.complete && element.naturalWidth === 0) {
      setImageIndex((index) => (index === imageIndex ? index + 1 : index));
    }
  }, [image, imageIndex]);

  return (
    <span className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
      {image ? (
        <img
          ref={imageRef}
          src={image}
          alt=""
          onError={() => setImageIndex((index) => (index === imageIndex ? index + 1 : index))}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="grid h-full place-items-center text-4xl text-brand-primary" aria-hidden="true">
          {icon}
        </span>
      )}
    </span>
  );
}
