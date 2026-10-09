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

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/"
          className="text-sm font-bold text-orange-600 hover:text-orange-700"
        >
          ← Back to shop
        </Link>

        <div className="mt-6 grid gap-10 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm font-black uppercase tracking-wider text-orange-500">
              {product.brand}
            </div>

            <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">
                {product.model}
              </span>

              <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
                {product.quality}
              </span>

              <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-600">
                In Stock
              </span>
            </div>

            <div className="mt-6">
              <div className="text-3xl font-black text-slate-950">
                Rs. {product.price.toLocaleString("en-PK")}
              </div>

              {product.oldPrice > product.price && (
                <div className="mt-1 text-sm text-slate-400 line-through">
                  Rs. {product.oldPrice.toLocaleString("en-PK")}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="text-sm font-bold text-slate-500">
                Product Information
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-400">Category</div>
                  <div className="font-bold">{product.category}</div>
                </div>

                <div>
                  <div className="text-slate-400">Rating</div>
                  <div className="font-bold">★ {product.rating}</div>
                </div>

                <div>
                  <div className="text-slate-400">Available</div>
                  <div className="font-bold">{product.stock} units</div>
                </div>

                <div>
                  <div className="text-slate-400">Quality</div>
                  <div className="font-bold">{product.quality}</div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.max(1, value - 1))
                  }
                  className="px-4 text-xl font-bold"
                >
                  −
                </button>

                <span className="w-10 text-center font-black">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(product.stock, value + 1)
                    )
                  }
                  className="px-4 text-xl font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="h-12 flex-1 rounded-xl bg-orange-500 px-6 font-black text-white transition hover:bg-orange-600"
              >
                {added ? "✓ Added to Cart" : "Add to Cart"}
              </button>
            </div>

            <Link
              href="/cart"
              className="mt-3 text-center text-sm font-bold text-slate-500 hover:text-orange-600"
            >
              View Cart →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
