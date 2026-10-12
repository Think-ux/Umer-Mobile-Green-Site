import type { Product } from "@/data/store";

export function retailerPrice(product: Product) {
  const discountPercent = Math.min(100, Math.max(0, product.retailerDiscountPercent || 0));
  return Math.round(product.price * (100 - discountPercent)) / 100;
}

export function formatStorePrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
}
