export type OrderType = "Customer" | "Retailer";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Packed"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type CourierPreference =
  | "store_choice"
  | "postex"
  | "tcs"
  | "leopards"
  | "mnp"
  | "pakistan_post";

export type FulfillmentMethod = "delivery" | "store_pickup";

export const paymentMethods = ["JazzCash", "EasyPaisa", "Bank transfer"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];
export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";

const courierPreferenceLabels: Record<CourierPreference, string> = {
  store_choice: "Store chooses available service",
  postex: "PostEx",
  tcs: "TCS",
  leopards: "Leopards Courier",
  mnp: "M&P",
  pakistan_post: "Pakistan Post",
};

export function courierPreferenceLabel(preference: CourierPreference) {
  return courierPreferenceLabels[preference];
}

function isCourierPreference(value: unknown): value is CourierPreference {
  return (
    typeof value === "string" &&
    Object.hasOwn(courierPreferenceLabels, value)
  );
}

export type SavedOrder = {
  orderNumber: string;
  trackingCode?: string;
  orderType: OrderType;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    payment: string;
    fulfillmentMethod?: FulfillmentMethod;
    courierPreference?: CourierPreference;
  };
  items: {
    product: {
      id: number;
      name: string;
      price: number;
      slug?: string;
      image?: string;
    };
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  delivery: number | null;
  total: number | null;
  paymentStatus?: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
};

export function normalizeSavedOrder(value: unknown): SavedOrder | null {
  if (!value || typeof value !== "object") return null;
  const order = value as Record<string, unknown>;
  const customerValue = order.customer;
  if (!customerValue || typeof customerValue !== "object") return null;
  const customer = customerValue as Record<string, unknown>;
  const courierPreference = customer.courierPreference;
  const fulfillmentMethod = customer.fulfillmentMethod;
  const paymentStatus = order.paymentStatus;
  const allowedCourierPreferences: CourierPreference[] = [
    "store_choice",
    "postex",
    "tcs",
    "leopards",
    "mnp",
    "pakistan_post",
  ];
  if (
    typeof order.orderNumber !== "string" ||
    (order.orderType !== "Customer" &&
      order.orderType !== "Retailer" &&
      order.orderType !== "customer" &&
      order.orderType !== "retailer") ||
    (typeof order.total !== "number" && order.total !== null) ||
    typeof order.subtotal !== "number" ||
    (typeof order.delivery !== "number" && order.delivery !== null) ||
    typeof order.createdAt !== "string" ||
    typeof order.status !== "string" ||
    !["Pending", "Processing", "Packed", "Dispatched", "Delivered", "Cancelled"].includes(order.status) ||
    typeof customer.name !== "string" ||
    typeof customer.phone !== "string" ||
    typeof customer.address !== "string" ||
    typeof customer.city !== "string" ||
    typeof customer.payment !== "string" ||
    !Array.isArray(order.items)
  ) return null;

  const items: SavedOrder["items"] = [];
  for (const value of order.items) {
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    if (!item.product || typeof item.product !== "object") return null;
    const product = item.product as Record<string, unknown>;
    if (
      typeof item.quantity !== "number" ||
      typeof product.id !== "number" ||
      typeof product.name !== "string" ||
      typeof product.price !== "number"
    ) return null;

    items.push({
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        ...(typeof product.slug === "string" ? { slug: product.slug } : {}),
        ...(typeof product.image === "string" ? { image: product.image } : {}),
      },
      quantity: item.quantity,
      unitPrice:
        typeof item.unitPrice === "number" ? item.unitPrice : product.price,
    });
  }

  return {
    orderNumber: order.orderNumber,
    ...(typeof order.trackingCode === "string"
      ? { trackingCode: order.trackingCode }
      : {}),
    orderType: order.orderType === "retailer" || order.orderType === "Retailer"
      ? "Retailer"
      : "Customer",
    customer: {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      area: typeof customer.area === "string" ? customer.area : "",
      payment: customer.payment,
      fulfillmentMethod: fulfillmentMethod === "store_pickup" ? "store_pickup" : "delivery",
      ...(isCourierPreference(courierPreference) ? { courierPreference } : {}),
    },
    items,
    subtotal: order.subtotal,
    delivery: order.delivery,
    total: order.total,
    paymentStatus: paymentStatus === "Paid" || paymentStatus === "Refunded"
      ? paymentStatus
      : "Unpaid",
    status: order.status as OrderStatus,
    createdAt: order.createdAt,
  };
}
