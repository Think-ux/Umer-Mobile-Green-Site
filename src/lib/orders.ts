export type OrderType = "Customer" | "Retailer";

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Packed"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type SavedOrder = {
  orderNumber: string;
  orderType: OrderType;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    payment: string;
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
  delivery: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export const ORDERS_KEY = "umer-orders";
export const LAST_ORDER_KEY = "umer-last-order";
export const ORDERS_EVENT = "umer-orders-changed";
export const LAST_ORDER_EVENT = "umer-last-order-changed";

export function createOrderNumber() {
  return "UMP-" + Date.now().toString().slice(-8);
}

export function nowIso() {
  return new Date().toISOString();
}

export function readOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];

  try {
    const value = JSON.parse(
      localStorage.getItem(ORDERS_KEY) || "[]"
    );

    return Array.isArray(value) ? value as SavedOrder[] : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: SavedOrder[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event(ORDERS_EVENT));
}

export function updateSavedOrder(
  orderNumber: string,
  status: OrderStatus
) {
  const orders = readOrders().map((order) =>
    order.orderNumber === orderNumber
      ? { ...order, status }
      : order
  );

  saveOrders(orders);

  const lastRaw = localStorage.getItem(LAST_ORDER_KEY);

  if (lastRaw) {
    try {
      const last = JSON.parse(lastRaw);

      if (last.orderNumber === orderNumber) {
        localStorage.setItem(
          LAST_ORDER_KEY,
          JSON.stringify({ ...last, status })
        );
      }
    } catch {
      // Ignore malformed demo data.
    }
  }

  return orders;
}
