export type WholesaleProduct = {
  id: number;
  name: string;
  price: number;
  stock: number;
  retailerDiscountPercent: number;
};

export function retailerPrice(product: WholesaleProduct): number {
  const price = Number(product.price);
  const discount = Number(product.retailerDiscountPercent);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid product price.");
  }

  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    throw new Error("Invalid retailer discount.");
  }

  return Math.round(price * (1 - discount / 100) * 100) / 100;
}

export function calculateWholesaleSubtotal(
  items: Array<{ product: WholesaleProduct; quantity: number }>,
): number {
  if (items.length === 0) {
    throw new Error("Your wholesale cart is empty.");
  }

  return Math.round(
    items.reduce((sum, item) => {
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        throw new Error("Each product quantity must be between 1 and 99.");
      }

      return sum + retailerPrice(item.product) * item.quantity;
    }, 0) * 100,
  ) / 100;
}

export function meetsMinimumWholesaleOrder(
  subtotal: number,
  minimumOrderAmount: number,
): boolean {
  return Number.isFinite(subtotal)
    && Number.isFinite(minimumOrderAmount)
    && subtotal >= 0
    && minimumOrderAmount >= 0
    && subtotal >= minimumOrderAmount;
}
