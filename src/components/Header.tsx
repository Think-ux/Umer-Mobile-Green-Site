"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-black text-white">
            U
          </div>

          <div>
            <div className="text-lg font-black text-slate-900">
              Umer
            </div>

            <div className="-mt-1 text-xs font-semibold text-orange-500">
              MOBILE PARTS
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-700 hover:text-orange-500"
          >
            Home
          </Link>

          <Link
            href="/shop/displays"
            className="text-sm font-semibold text-slate-700 hover:text-orange-500"
          >
            Shop
          </Link>

          <Link
            href="/search"
            className="text-sm font-semibold text-slate-700 hover:text-orange-500"
          >
            Search
          </Link>

          <Link
            href="/retailer"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            For Retailers
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:border-orange-300 hover:text-orange-600"
          >
            Cart
            <span className="ml-1 text-orange-500">
              {itemCount}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-black text-white md:hidden"
          >
            Menu
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>

            <Link
              href="/shop/displays"
              onClick={() => setOpen(false)}
            >
              Shop
            </Link>

            <Link
              href="/search"
              onClick={() => setOpen(false)}
            >
              Search
            </Link>

            <Link
              href="/retailer"
              onClick={() => setOpen(false)}
            >
              For Retailers
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}