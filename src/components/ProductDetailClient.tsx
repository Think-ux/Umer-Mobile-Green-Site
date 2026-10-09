"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/data/store";

type Props = {
  product: Product;
};

export default function ProductDetailClient({ product }: Props) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inStock = product.stock > 0;
  const maxQuantity = Math.max(1, product.stock);

  const handleAdd = () => {
    if (!inStock) return;

    addToCart(product, quantity);
    setAdded(true);

    window.setTimeout(() => setAdded(false), 2000);
  };

  const formatPrice = (price: number) =>
    `Rs. ${price.toLocaleString("en-PK")}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
        >
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/search" className="hover:text-orange-600">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">
            {product.name}
          </span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <section className="min-w-0">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
              <div className="absolute left-5 top-5 z-10 rounded-full bg-orange-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-orange-700">
                {product.quality} Quality
              </div>

              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-5 transition duration-500 hover:scale-105 sm:p-8"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <span className="text-xl text-orange-500">✓</span>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  Product Details
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <span className="text-xl text-orange-500">⌕</span>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  Model Information
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <span className="text-xl text-orange-500">↗</span>
                <p className="mt-1 text-xs font-bold text-slate-700">
                  Easy Ordering
                </p>
              </div>
            </div>
          </section>

          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 lg:p-10">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">
              {product.brand} Spare Parts
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                Model: {product.model}
              </span>

              <span className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700">
                {product.quality}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-sm font-bold ${
                  inStock
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {inStock ? "In Stock" : "Sold Out"}
              </span>
            </div>

            <div className="mt-7 border-b border-slate-100 pb-7">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {formatPrice(product.price)}
                </span>

                {product.oldPrice > product.price && (
                  <>
                    <span className="pb-1 text-base text-slate-400 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>

                    <span className="mb-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-black text-green-700">
                      SAVE{" "}
                      {Math.round(
                        ((product.oldPrice - product.price) /
                          product.oldPrice) *
                          100
                      )}
                      %
                    </span>
                  </>
                )}
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Final availability and compatibility should be confirmed
                before ordering.
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-base font-black text-slate-900">
                Product Information
              </h2>

              <dl className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-slate-500">Brand</dt>
                  <dd className="text-right text-sm font-bold">
                    {product.brand}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-slate-500">Compatible Model</dt>
                  <dd className="text-right text-sm font-bold">
                    {product.model}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-slate-500">Category</dt>
                  <dd className="text-right text-sm font-bold">
                    {product.category}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-slate-500">Quality Grade</dt>
                  <dd className="text-right text-sm font-bold">
                    {product.quality}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-slate-500">Availability</dt>
                  <dd className="text-right text-sm font-bold">
                    {inStock ? `${product.stock} units` : "Out of stock"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-slate-500">Customer Rating</dt>
                  <dd className="text-right text-sm font-bold">
                    <span className="text-amber-500">★</span>{" "}
                    {product.rating}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-7">
              <label
                htmlFor="product-quantity"
                className="mb-3 block text-sm font-black"
              >
                Select Quantity
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex h-12 w-fit items-center rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={!inStock || quantity <= 1}
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="h-full w-11 rounded-l-xl text-xl font-bold hover:bg-slate-50 disabled:opacity-40"
                  >
                    −
                  </button>

                  <input
                    id="product-quantity"
                    aria-label="Product quantity"
                    type="number"
                    min={1}
                    max={maxQuantity}
                    disabled={!inStock}
                    value={quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);

                      if (!Number.isFinite(value)) return;

                      setQuantity(
                        Math.min(
                          maxQuantity,
                          Math.max(1, Math.floor(value || 1))
                        )
                      );
                    }}
                    className="h-full w-14 border-x border-slate-200 text-center font-black outline-none"
                  />

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={!inStock || quantity >= maxQuantity}
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(maxQuantity, current + 1)
                      )
                    }
                    className="h-full w-11 rounded-r-xl text-xl font-bold hover:bg-slate-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!inStock}
                  className="min-h-12 flex-1 rounded-xl bg-orange-500 px-6 py-3 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {!inStock
                    ? "Currently Unavailable"
                    : added
                      ? "✓ Added to Cart"
                      : "Add to Cart →"}
                </button>
              </div>

              {added && (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-bold text-green-700"
                >
                  Product added to your cart successfully.
                </p>
              )}

              <Link
                href="/cart"
                className="mt-4 flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-black text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
              >
                View Shopping Cart
              </Link>
            </div>

            <div className="mt-7 rounded-2xl bg-orange-50 p-4">
              <p className="text-sm font-black text-slate-900">
                Need help choosing the right part?
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Confirm your exact mobile model and part compatibility before
                placing an order.
              </p>
              <Link
                href="/customer-care"
                className="mt-3 inline-flex font-bold text-orange-700 hover:text-orange-800"
              >
                Contact Customer Support →
              </Link>
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-widest text-orange-600">
            Shop with confidence
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Product details at a glance
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <h3 className="font-black">Check compatibility</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Verify the exact model before purchasing your spare part.
              </p>
            </div>

            <div>
              <h3 className="font-black">Review your order</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Check quantities and cart totals before checkout.
              </p>
            </div>

            <div>
              <h3 className="font-black">Get assistance</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Contact customer support if you need product information.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
