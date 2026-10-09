"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/data/store";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {product.stock <= 5 && (
            <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
              Low Stock
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-orange-500">
            {product.brand}
          </span>

          <span className="text-xs text-slate-400">
            ★ {product.rating}
          </span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="min-h-12 font-bold leading-6 text-slate-900 hover:text-orange-500">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-lg font-black text-slate-950">
              Rs. {product.price.toLocaleString("en-PK")}
            </div>

            {product.oldPrice > product.price && (
              <div className="text-xs text-slate-400 line-through">
                Rs. {product.oldPrice.toLocaleString("en-PK")}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {product.stock > 0 ? "Add" : "Sold Out"}
          </button>
        </div>
      </div>
    </article>
  );
}
