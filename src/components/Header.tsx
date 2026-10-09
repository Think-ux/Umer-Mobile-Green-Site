"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { categories } from "@/data/store";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { itemCount } = useCart();

  const categoryHref = (name: string) =>
    `/shop/${name.toLowerCase().replace(/\s+/g, "-")}`;

  const closeMenus = () => {
    setMobileOpen(false);
    setCategoriesOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      {/* Announcement bar */}
      <div className="bg-slate-950 px-3 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Umer Mobile Parts
        <span className="mx-2 text-orange-400">|</span>
        Find the right part for your device
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
                Umer
              </span>
              <span className="block text-[10px] font-extrabold tracking-[0.16em] text-orange-600 sm:text-xs">
                MOBILE PARTS
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
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button
              type="button"
              aria-expanded={categoriesOpen}
              aria-controls="desktop-category-menu"
              onClick={() => setCategoriesOpen((value) => !value)}
              className={`flex h-full items-center gap-2 border-b-[3px] px-4 text-sm font-bold transition ${
                categoriesOpen
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-transparent bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              <span aria-hidden="true">☰</span>
              All Categories
              <span aria-hidden="true">{categoriesOpen ? "▴" : "▾"}</span>
            </button>

            {categoriesOpen && (
              <div
                id="desktop-category-menu"
                className="absolute left-0 top-full z-50 w-72 rounded-b-xl border border-slate-200 bg-white py-2 shadow-xl"
              >
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={categoryHref(category.name)}
                    onClick={closeMenus}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700 focus:bg-orange-50 focus:outline-none"
                  >
                    <span>{category.name}</span>
                    <span aria-hidden="true" className="text-orange-500">
                      →
                    </span>
                  </Link>
                ))}

                <div className="mx-4 border-t border-slate-100 pt-2">
                  <Link
                    href="/shop/displays"
                    onClick={closeMenus}
                    className="block py-2 text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    Browse Products →
                  </Link>
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
            href="/shop/displays"
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
                href="/shop/displays"
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
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={categoryHref(category.name)}
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                    >
                      {category.name}
                    </Link>
                  ))}
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