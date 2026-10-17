export type RetailerOrderStatus =
  | "Pending"
  | "Processing"
  | "Packed"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type RetailerOrderItem = {
  productId: number | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  lineTotal: number;
};

export type RetailerOrder = {
  id: number;
  retailerUserId: string;
  orderNumber: string;
  status: RetailerOrderStatus;
  subtotal: number;
  total: number;
  createdAt: string;
  items: RetailerOrderItem[];
};

export function normalizeRetailerOrderStatus(value: string): RetailerOrderStatus {
  const statuses: RetailerOrderStatus[] = [
    "Pending",
    "Processing",
    "Packed",
    "Dispatched",
    "Delivered",
    "Cancelled",
  ];

  if (!statuses.includes(value as RetailerOrderStatus)) {
    throw new Error("Unknown retailer order status.");
  }

  return value as RetailerOrderStatus;
}
