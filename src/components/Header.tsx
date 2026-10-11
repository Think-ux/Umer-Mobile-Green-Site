"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useCatalog } from "@/components/CatalogProvider";
import { categorySlug } from "@/data/store";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [mobileCategoryName, setMobileCategoryName] = useState<string | null>(null);
  const { itemCount } = useCart();
  const { categories, products, settings } = useCatalog();

  const categoryHref = (name: string) => `/shop/${categorySlug(name)}`;
  const activeCategory =
    categories.find((category) => category.name === activeCategoryName) ??
    categories[0];
  const activeCategoryProducts = activeCategory
    ? products.filter((product) => product.category === activeCategory.name)
    : [];

  const closeMenus = () => {
    setMobileOpen(false);
    setCategoriesOpen(false);
    setMobileCategoryName(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      {/* Announcement bar */}
      <div className="bg-slate-950 px-3 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Umer Mobile Parts
        <span className="mx-2 text-orange-400">|</span>
        Wholesale &amp; Retail
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-[82px] items-center gap-3 py-3 lg:gap-7">
          {/* Brand */}
          <Link
            href="/"
            onClick={closeMenus}
            aria-label="Umer Mobile Parts home"
            className="flex shrink-0 items-center gap-2"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-2xl font-black text-white shadow-sm">
              U
            </span>

            <span className="leading-tight">
              <span className="block text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                {settings.storeName}
              </span>
              <span className="block text-[10px] font-extrabold tracking-[0.16em] text-orange-600 sm:text-xs">
                WHOLESALE &amp; RETAIL
              </span>
            </span>
          </Link>

          {/* Desktop search */}
          <form
            action="/search"
            method="GET"
            role="search"
            className="hidden min-w-0 flex-1 md:block"
          >
            <label htmlFor="desktop-product-search" className="sr-only">
              Search mobile spare parts
            </label>

            <div className="flex h-12 overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 transition focus-within:border-orange-500 focus-within:bg-white">
              <input
                id="desktop-product-search"
                type="search"
                name="q"
                placeholder="Search parts, brands or mobile models..."
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                aria-label="Search products"
                className="bg-orange-500 px-5 font-bold text-white transition hover:bg-orange-600"
              >
                Search
              </button>
            </div>
          </form>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Shopping cart, ${itemCount} items`}
            className="ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-orange-300 hover:bg-orange-50 md:ml-0"
          >
            <span aria-hidden="true" className="text-xl">
              🛒
            </span>

            <span className="hidden text-sm font-bold text-slate-800 sm:block">
              Cart
            </span>

            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-black text-white">
              {itemCount}
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-2xl text-slate-800 transition hover:border-orange-400 hover:text-orange-600 md:hidden"
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>

        {/* Desktop primary navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden min-h-12 items-center gap-7 md:flex"
        >
          {/* Category dropdown */}
          <div
            className="relative self-stretch"
            onMouseEnter={() => {
              setCategoriesOpen(true);
              setActiveCategoryName((current) => current ?? categories[0]?.name ?? null);
            }}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button
              type="button"
              aria-expanded={categoriesOpen}
              aria-controls="desktop-category-menu"
              onClick={() => {
                setCategoriesOpen((value) => !value);
                setActiveCategoryName((current) => current ?? categories[0]?.name ?? null);
              }}
              className={`flex h-full items-center gap-2 border-b-[3px] px-4 text-sm font-bold transition ${
                categoriesOpen
                  ? "border-orange-500 bg-transparent text-orange-600"
                  : "border-transparent bg-transparent text-slate-700 hover:border-orange-400 hover:text-orange-600"
              }`}
            >
              <span aria-hidden="true">☰</span>
              All Categories
              <span aria-hidden="true">{categoriesOpen ? "▴" : "▾"}</span>
            </button>

            {categoriesOpen && (
              <div
                id="desktop-category-menu"
                className="absolute left-0 top-full z-50 grid max-h-[70vh] w-[min(56rem,calc(100vw-2rem))] grid-cols-[minmax(13rem,0.8fr)_minmax(0,1.2fr)] overflow-hidden rounded-b-2xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="max-h-[70vh] overflow-y-auto border-r border-slate-100 p-3">
                  <p className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400">
                    Browse categories
                  </p>
                  {categories.map((category) => {
                    const productCount = products.filter(
                      (product) => product.category === category.name
                    ).length;
                    const active = activeCategory?.name === category.name;
                    return (
                      <div
                        key={category.name}
                        onMouseEnter={() => setActiveCategoryName(category.name)}
                        className={`flex items-center rounded-xl ${
                          active ? "bg-orange-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <Link
                          href={categoryHref(category.name)}
                          onClick={closeMenus}
                          className="min-w-0 flex-1 px-3 py-3 text-sm font-bold text-slate-800"
                        >
                          <span className="flex items-center gap-2">
                            {category.icon_image_url ? (
                              <img src={category.icon_image_url} alt="" className="h-8 w-8 rounded-md object-cover" />
                            ) : (
                              <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-md bg-orange-100 text-orange-600">
                                {category.icon || "▣"}
                              </span>
                            )}
                            <span className="block truncate">{category.name}</span>
                          </span>
                          <span className="mt-1 block text-xs font-medium text-slate-500">
                            {productCount} {productCount === 1 ? "product" : "products"}
                          </span>
                        </Link>
                        <button
                          type="button"
                          aria-label={`Show products in ${category.name}`}
                          aria-pressed={active}
                          onFocus={() => setActiveCategoryName(category.name)}
                          onClick={() => setActiveCategoryName(category.name)}
                          className="self-stretch px-4 text-lg text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
                        >
                          →
                        </button>
                      </div>
                    );
                  })}
                  <Link
                    href="/search"
                    onClick={closeMenus}
                    className="mt-2 block border-t border-slate-100 px-3 py-4 text-sm font-black text-orange-600 hover:text-orange-700"
                  >
                    Browse all products →
                  </Link>
                </div>
                <div className="min-h-0 overflow-y-auto p-5">
                  {activeCategory ? (
                    <>
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Products in
                          </p>
                          <h2 className="mt-1 text-lg font-black text-slate-900">
                            {activeCategory.name}
                          </h2>
                        </div>
                        <Link
                          href={categoryHref(activeCategory.name)}
                          onClick={closeMenus}
                          className="shrink-0 text-sm font-bold text-orange-600 hover:text-orange-700"
                        >
                          View category →
                        </Link>
                      </div>
                      {activeCategoryProducts.length > 0 ? (
                        <div className="mt-3 grid gap-1 sm:grid-cols-2">
                          {activeCategoryProducts.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.slug}`}
                              onClick={closeMenus}
                              className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                            >
                              {product.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="py-8 text-sm text-slate-500">
                          No published products in this category yet.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-8 text-sm text-slate-500">
                      Categories will appear here when they are published.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
          >
            Home
          </Link>

          <Link
            href="/search"
            className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
          >
            Shop
          </Link>

          <Link
            href="/track-order"
            className="text-sm font-semibold text-slate-700 transition hover:text-orange-600"
          >
            Track Order
          </Link>

          <Link
            href="/retailer"
            className="ml-auto rounded-lg px-3 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-50"
          >
            For Retailers →
          </Link>
        </nav>

        {/* Mobile navigation */}
        {mobileOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-slate-200 py-4 md:hidden"
          >
            {/* Mobile search */}
            <form
              action="/search"
              method="GET"
              role="search"
              className="mb-4 flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-orange-500"
            >
              <label htmlFor="mobile-product-search" className="sr-only">
                Search mobile spare parts
              </label>

              <input
                id="mobile-product-search"
                type="search"
                name="q"
                placeholder="Search parts or models..."
                className="min-w-0 flex-1 px-3 py-3 text-sm outline-none"
              />

              <button
                type="submit"
                className="bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600"
              >
                Search
              </button>
            </form>

            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
              >
                Home
              </Link>

              <Link
                href="/search"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
              >
                Shop Products
              </Link>

              {/* Expandable mobile categories */}
              <button
                type="button"
                aria-expanded={categoriesOpen}
                aria-controls="mobile-category-menu"
                onClick={() => setCategoriesOpen((value) => !value)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-bold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
              >
                <span>All Categories</span>
                <span aria-hidden="true">
                  {categoriesOpen ? "−" : "+"}
                </span>
              </button>

              {categoriesOpen && (
                <div
                  id="mobile-category-menu"
                  className="ml-3 border-l-2 border-orange-200 pl-3"
                >
                  {categories.map((category) => {
                    const categoryProducts = products.filter(
                      (product) => product.category === category.name
                    );
                    const expanded = mobileCategoryName === category.name;

                    return (
                      <div key={category.name} className="border-b border-slate-100 last:border-0">
                        <div className="flex items-center">
                          <Link
                            href={categoryHref(category.name)}
                            onClick={closeMenus}
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                          >
                            {category.icon_image_url ? (
                              <img src={category.icon_image_url} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                            ) : (
                              <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-orange-100 text-orange-600">
                                {category.icon || "▣"}
                              </span>
                            )}
                            {category.name}
                            <span className="ml-2 text-xs font-medium text-slate-400">
                              {categoryProducts.length}
                            </span>
                          </Link>
                          <button
                            type="button"
                            aria-label={`${expanded ? "Hide" : "Show"} products in ${category.name}`}
                            aria-expanded={expanded}
                            onClick={() => setMobileCategoryName(expanded ? null : category.name)}
                            className="rounded-lg px-4 py-3 text-orange-600"
                          >
                            {expanded ? "−" : "+"}
                          </button>
                        </div>
                        {expanded && (
                          <div className="mb-2 ml-3 border-l border-orange-200 pl-3">
                            {categoryProducts.length > 0 ? categoryProducts.map((product) => (
                              <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                onClick={closeMenus}
                                className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                              >
                                {product.name}
                              </Link>
                            )) : (
                              <p className="px-3 py-2 text-xs text-slate-500">
                                No published products yet.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <Link
                href="/search"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
              >
                Search Products
              </Link>

              <Link
                href="/track-order"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-orange-50 hover:text-orange-700"
              >
                Track Order
              </Link>

              <Link
                href="/retailer"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-bold text-orange-700 hover:bg-orange-50"
              >
                For Retailers / Wholesale Inquiry →
              </Link>

              <Link
                href="/cart"
                onClick={closeMenus}
                className="mt-2 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                <span>View Shopping Cart</span>
                <span className="rounded-full bg-orange-500 px-2 py-1 text-xs">
                  {itemCount}
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}