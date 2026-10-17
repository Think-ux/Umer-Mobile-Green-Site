"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useCatalog } from "@/components/CatalogProvider";
import { Badge, Button, Card } from "@/components/ui";
import type { Product } from "@/data/store";
import { formatStorePrice, retailerPrice } from "@/lib/pricing";

type Props = {
  product: Product;
  variant?: "default" | "compact";
};

export default function ProductCard({ product, variant = "default" }: Props) {
  const { addToCart } = useCart();
  const { isRetailer } = useCatalog();
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const inStock = product.stock > 0;

  const discounted =
    product.oldPrice > product.price && product.oldPrice > 0;

  const discount = discounted
    ? Math.round(
        ((product.oldPrice - product.price) / product.oldPrice) * 100
      )
    : 0;
  const hasRetailerDiscount = isRetailer && product.retailerDiscountPercent > 0;
  const discountedRetailerPrice = hasRetailerDiscount ? retailerPrice(product) : null;

  function handleAdd() {
    if (!inStock) return;

    addToCart(product, 1);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1600);
  }

  return (
    <Card
      as="article"
      className="group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-xl hover:shadow-slate-900/5"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-slate-100"
        aria-label={`View ${product.name}`}
      >
        <div className={`relative ${variant === "compact" ? "aspect-[4/3]" : "aspect-square"}`}>
          {imageFailed ? (
            <span className="absolute inset-0 grid place-items-center bg-slate-100 text-sm font-semibold text-slate-500">
              Image unavailable
            </span>
          ) : (
            <Image
              src={product.image}
              alt={product.name}
              fill
              onError={() => setImageFailed(true)}
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          )}
        </div>

        {discounted && (
          <Badge variant="solid" className="absolute left-3 top-3 rounded-lg px-2.5 py-1.5 shadow-sm">
            -{discount}%
          </Badge>
        )}

        {!inStock ? (
          <Badge variant="neutral" className="absolute right-3 top-3 rounded-lg bg-slate-900/90 px-2.5 py-1.5 text-white">
            Sold Out
          </Badge>
        ) : product.stock <= 5 ? (
          <Badge variant="danger" className="absolute right-3 top-3 rounded-lg px-2.5 py-1.5">
            Low Stock
          </Badge>
        ) : null}

        <Badge variant="neutral" className="absolute bottom-3 left-3 rounded-lg border border-white/70 bg-white/90 px-2.5 py-1.5 text-slate-700 backdrop-blur">
          {product.quality}
        </Badge>
      </Link>

      <div className={`flex flex-1 flex-col ${variant === "compact" ? "p-4" : "p-4 sm:p-5"}`}>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="brand" className="rounded-none bg-transparent p-0 text-xs font-black uppercase tracking-wider text-lime-900">
            {product.brand}
          </Badge>

          <span className="shrink-0 text-xs font-bold text-amber-500">
            ★ {product.rating}
          </span>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="mt-2"
        >
          <h3 className="min-h-12 text-base font-extrabold leading-6 text-slate-900 transition group-hover:text-lime-800">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-slate-500">
          Model: {product.model}
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
          <span className="text-xl font-black tracking-tight text-slate-950">
            Rs. {product.price.toLocaleString("en-PK")}
          </span>

          {discounted && (
            <span className="pb-0.5 text-xs font-medium text-slate-400 line-through">
              Rs. {product.oldPrice.toLocaleString("en-PK")}
            </span>
          )}
        </div>
        {hasRetailerDiscount && discountedRetailerPrice !== null && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <p className="text-2xs font-black uppercase tracking-wide text-emerald-800">
              Retailer price · {product.retailerDiscountPercent}% off
            </p>
            <p className="mt-0.5 text-lg font-black text-emerald-900">{formatStorePrice(discountedRetailerPrice)}</p>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              inStock ? "bg-green-500" : "bg-red-500"
            }`}
          />

          <span className={inStock ? "text-green-700" : "text-red-600"}>
            {inStock
              ? `${product.stock} units available`
              : "Currently unavailable"}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <Button
            type="button"
            variant="primary"
            onClick={handleAdd}
            disabled={!inStock}
            className="min-h-11 w-full disabled:bg-slate-300"
          >
            {added ? (
              <>
                <span aria-hidden="true">✓</span>
                Added to Cart
              </>
            ) : inStock ? (
              <>
                <span aria-hidden="true">+</span>
                Add to Cart
              </>
            ) : (
              "Sold Out"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
