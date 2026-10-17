"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useCatalog } from "@/components/CatalogProvider";
import { categorySlug } from "@/data/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function Header({
  darkMode,
  onToggleTheme,
}: {
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [mobileCategoryName, setMobileCategoryName] = useState<string | null>(null);
  const [accountLabel, setAccountLabel] = useState("Guest");
  const { itemCount } = useCart();
  const { categories, products, settings } = useCatalog();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const updateAccountLabel = (user: {
      user_metadata: Record<string, unknown>;
    } | null) => {
      const metadataName = [
        user?.user_metadata.full_name,
        user?.user_metadata.name,
        user?.user_metadata.display_name,
      ].find((value): value is string => typeof value === "string" && value.trim().length > 0);
      setAccountLabel(metadataName?.trim() || (user ? "My Account" : "Guest"));
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAccountLabel(session?.user ?? null);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setAccountLabel("Account error");
      } else {
        updateAccountLabel(data.session?.user ?? null);
      }
    });

    const refreshAccountLabel = () => {
      void supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          setAccountLabel("Account error");
        } else {
          updateAccountLabel(data.session?.user ?? null);
        }
      });
    };
    window.addEventListener("focus", refreshAccountLabel);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", refreshAccountLabel);
    };
  }, [pathname]);

  const categoryHref = (name: string) => `/shop/${categorySlug(name)}`;
  const activeCategory =
    categories.find((category) => category.name === activeCategoryName) ??
    categories.find((category) => category.parentId === null) ??
    categories[0];
  const activeCategoryNames = new Set([
    activeCategory?.name,
    ...categories
      .filter((category) => category.parentId === activeCategory?.id)
      .map((category) => category.name),
  ].filter((name): name is string => Boolean(name)));
  const activeCategoryProducts = activeCategory
    ? products.filter((product) => activeCategoryNames.has(product.category))
    : [];
  const activeSubcategories = categories.filter(
    (category) => category.parentId === activeCategory?.id
  );

  const closeMenus = () => {
    setMobileOpen(false);
    setCategoriesOpen(false);
    setMobileCategoryName(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-market-800 bg-market-950 text-white shadow-sm">
      {/* Announcement bar */}
      <div className="border-b border-market-800 bg-market-900 px-4 py-2 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span><span className="mr-1.5 text-lime-300" aria-hidden="true">●</span>Wholesale &amp; Retail</span>
            <span className="hidden sm:inline"><span className="mr-1.5 text-lime-300" aria-hidden="true">●</span>Search by brand, model or part</span>
          </div>
          <span className="hidden text-right sm:inline">Find the right part for your repair</span>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-header items-center gap-1 py-2 sm:gap-3 sm:py-3 lg:gap-7">
          {/* Brand */}
          <Link
            href="/"
            onClick={closeMenus}
            aria-label="Umer Mobile Parts home"
            className="flex min-w-0 items-center gap-2"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary text-2xl font-black text-brand-primary-foreground shadow-sm">
              U
            </span>

            <span className="min-w-0 leading-tight">
              <span className="block truncate text-lg font-black tracking-tight text-white sm:text-xl">
                {settings.storeName}
              </span>
              <span className="block text-3xs font-extrabold tracking-eyebrow-compact text-lime-300 sm:text-xs">
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

            <div className="flex h-12 overflow-hidden rounded-xl border border-market-800 bg-market-900 transition focus-within:border-brand-primary focus-within:bg-market-800">
              <input
                id="desktop-product-search"
                type="search"
                name="q"
                placeholder="Search parts, brands or mobile models..."
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                aria-label="Search products"
                className="bg-brand-primary px-5 font-bold text-brand-primary-foreground transition hover:bg-brand-primary-hover"
              >
                Search
              </button>
            </div>
          </form>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Shopping cart, ${itemCount} items`}
            className="ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-market-800 px-3 py-2.5 transition hover:border-brand-primary hover:bg-market-900 md:ml-0"
          >
            <span aria-hidden="true" className="text-xl">
              🛒
            </span>

            <span className="hidden text-sm font-bold text-slate-100 sm:block">
              Cart
            </span>

            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-primary px-1.5 text-xs font-black text-brand-primary-foreground">
              {itemCount}
            </span>
          </Link>

          <Link
            href="/account"
            aria-label={accountLabel === "Guest" ? "Guest. Sign in or create an account" : `Customer account: ${accountLabel}`}
            title={accountLabel === "Guest" ? "Guest · Sign in or create an account" : accountLabel}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-lime-400/40 bg-lime-400/10 px-2 py-2.5 text-xs font-bold text-lime-200 transition hover:border-lime-300 hover:bg-lime-400/20 sm:gap-2 sm:px-3 sm:text-sm"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5 shrink-0"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path strokeLinecap="round" d="M5 20c.7-3.3 3.2-5 7-5s6.3 1.7 7 5" />
            </svg>
            <span className="max-w-24 truncate">
              {accountLabel === "Guest" ? (
                <>
                  <span className="hidden sm:inline">Sign in / Register</span>
                  <span className="sm:hidden">Account</span>
                </>
              ) : (
                accountLabel
              )}
            </span>
          </Link>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={darkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-market-800 text-slate-200 transition hover:border-brand-primary hover:text-brand-primary"
          >
            {darkMode ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
              </svg>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-market-800 text-2xl text-white transition hover:border-brand-primary hover:text-brand-primary md:hidden"
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>

        {/* Desktop primary navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden min-h-12 items-center gap-2 md:flex lg:gap-7"
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
              className={`flex h-full items-center gap-2 border-b-active-nav px-4 text-sm font-bold transition ${
                categoriesOpen
                  ? "border-brand-primary bg-transparent text-brand-primary"
                  : "border-transparent bg-transparent text-slate-200 hover:border-brand-primary hover:text-brand-primary"
              }`}
            >
              <span aria-hidden="true">☰</span>
              All Categories
              <span aria-hidden="true">{categoriesOpen ? "▴" : "▾"}</span>
            </button>

            {categoriesOpen && (
              <div
                id="desktop-category-menu"
                className="absolute left-0 top-full z-50 grid max-h-dropdown-height w-dropdown-width grid-cols-category-menu overflow-hidden rounded-b-2xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="max-h-dropdown-height overflow-y-auto border-r border-slate-100 p-3">
                  <p className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400">
                    Browse categories
                  </p>
                  {categories.map((category) => {
                    const productCount = products.filter(
                      (product) =>
                        product.category === category.name ||
                        categories.some(
                          (child) =>
                            child.parentId === category.id &&
                            child.name === product.category
                        )
                    ).length;
                    const active = activeCategory?.name === category.name;
                    return (
                      <div
                        key={category.name}
                        onMouseEnter={() => setActiveCategoryName(category.name)}
                        className={`flex items-center rounded-xl ${
                          category.parentId !== null ? "ml-4 border-l border-slate-200 pl-2" : ""} ${
                          active ? "bg-lime-50" : "hover:bg-slate-50"
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
                              <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-md bg-lime-100 text-lime-700">
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
                          className="self-stretch px-4 text-lg text-lime-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
                        >
                          →
                        </button>
                      </div>
                    );
                  })}
                  <Link
                    href="/search"
                    onClick={closeMenus}
                    className="mt-2 block border-t border-slate-100 px-3 py-4 text-sm font-black text-lime-700 hover:text-lime-900"
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
                          className="shrink-0 text-sm font-bold text-lime-700 hover:text-lime-900"
                        >
                          View category →
                        </Link>
                      </div>
                      {activeSubcategories.length > 0 && (
                        <div className="mt-4 border-b border-slate-100 pb-4">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Browse part types
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {activeSubcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={categoryHref(subcategory.name)}
                                onClick={closeMenus}
                                className="rounded-full bg-lime-50 px-3 py-2 text-xs font-bold text-lime-800 hover:bg-lime-100"
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeCategoryProducts.length > 0 ? (
                        <div className="mt-3 grid gap-1 sm:grid-cols-2">
                          {activeCategoryProducts.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.slug}`}
                              onClick={closeMenus}
                              className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-lime-50 hover:text-lime-900"
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

          <div className="ml-1 flex items-center gap-3 border-l border-slate-700 pl-4 lg:ml-4 lg:gap-7 lg:pl-7">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-200 transition hover:text-brand-primary"
            >
              Home
            </Link>

            <Link
              href="/#brands"
              className="text-sm font-semibold text-slate-200 transition hover:text-brand-primary"
            >
              Brands
            </Link>

            <Link
              href="/track-order"
              className="text-sm font-semibold text-slate-200 transition hover:text-brand-primary"
            >
              Track Order
            </Link>

            <Link
              href="/customer-care"
              className="text-sm font-semibold text-slate-200 transition hover:text-brand-primary"
            >
              Contact
            </Link>
          </div>

          <Link
            href="/retailer"
            className="ml-auto rounded-lg px-3 py-2 text-sm font-bold text-brand-primary transition hover:bg-slate-900"
          >
            For Retailers →
          </Link>
        </nav>

        {/* Mobile navigation */}
        {mobileOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-slate-800 py-4 md:hidden"
          >
            {/* Mobile search */}
            <form
              action="/search"
              method="GET"
              role="search"
              className="mb-4 flex overflow-hidden rounded-xl border border-slate-700 bg-slate-900 focus-within:border-brand-primary"
            >
              <label htmlFor="mobile-product-search" className="sr-only">
                Search mobile spare parts
              </label>

              <input
                id="mobile-product-search"
                type="search"
                name="q"
                placeholder="Search parts or models..."
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="bg-brand-primary px-4 text-sm font-bold text-brand-primary-foreground hover:bg-brand-primary-hover"
              >
                Search
              </button>
            </form>

            <div className="flex flex-col gap-1">
              {/* Expandable mobile categories */}
              <button
                type="button"
                aria-expanded={categoriesOpen}
                aria-controls="mobile-category-menu"
                onClick={() => setCategoriesOpen((value) => !value)}
                className="flex items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-bold text-slate-100 hover:bg-slate-900 hover:text-brand-primary"
              >
                <span>All Categories</span>
                <span aria-hidden="true">
                  {categoriesOpen ? "−" : "+"}
                </span>
              </button>

              {categoriesOpen && (
                <div
                  id="mobile-category-menu"
                  className="ml-3 border-l-2 border-lime-400/60 pl-3"
                >
                  {categories.map((category) => {
                    const categoryProducts = products.filter(
                      (product) => product.category === category.name
                    );
                    const expanded = mobileCategoryName === category.name;
                    const parentCategory = categories.find(
                      (item) => item.id === category.parentId
                    );

                    return (
                      <div key={category.name} className="border-b border-slate-100 last:border-0">
                        <div className={`flex items-center ${parentCategory ? "ml-4" : ""}`}>
                          <Link
                            href={categoryHref(category.name)}
                            onClick={closeMenus}
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-900 hover:text-brand-primary"
                          >
                            {category.icon_image_url ? (
                              <img src={category.icon_image_url} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                            ) : (
                              <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-lime-400/10 text-lime-300">
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
                            className="rounded-lg px-4 py-3 text-brand-primary"
                          >
                            {expanded ? "−" : "+"}
                          </button>
                        </div>
                        {expanded && (
                          <div className="mb-2 ml-3 border-l border-lime-400/60 pl-3">
                            {categoryProducts.length > 0 ? categoryProducts.map((product) => (
                              <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                onClick={closeMenus}
                                className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 hover:text-brand-primary"
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

              <div className="my-2 border-t border-slate-800" />

              <Link
                href="/"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900 hover:text-brand-primary"
              >
                Home
              </Link>

              <Link
                href="/#brands"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900 hover:text-brand-primary"
              >
                Brands
              </Link>

              <Link
                href="/track-order"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900 hover:text-brand-primary"
              >
                Track Order
              </Link>

              <Link
                href="/customer-care"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900 hover:text-brand-primary"
              >
                Contact
              </Link>

              <Link
                href="/account"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-bold text-brand-primary hover:bg-slate-900"
              >
                {accountLabel === "Guest" ? "Guest · Sign in or create account" : `My Account · ${accountLabel}`}
              </Link>

              <Link
                href="/retailer"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-bold text-brand-primary hover:bg-slate-900"
              >
                For Retailers / Wholesale Inquiry →
              </Link>

              <Link
                href="/cart"
                onClick={closeMenus}
                className="mt-2 flex items-center justify-between rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-brand-primary-foreground hover:bg-brand-primary-hover"
              >
                <span>View Shopping Cart</span>
                <span className="rounded-full bg-slate-950 px-2 py-1 text-xs text-brand-primary">
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