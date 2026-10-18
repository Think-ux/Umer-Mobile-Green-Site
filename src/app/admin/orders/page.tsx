"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { courierPreferenceLabel, type CourierPreference, type FulfillmentMethod, type OrderStatus, type PaymentStatus, type SavedOrder } from "@/lib/orders";

type OrderRow = {
  id: number;
  order_number: string;
  tracking_code: string;
  order_type: "Customer";
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  delivery_area: string;
  fulfillment_method: FulfillmentMethod;
  preferred_courier: CourierPreference;
  payment_method: string;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery: number | null;
  total: number | null;
  status: OrderStatus;
  created_at: string;
};

type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_slug: string;
  product_image: string;
  unit_price: number;
  quantity: number;
};

type AdminOrder = SavedOrder & { id: number; trackingCode: string; paymentStatus: PaymentStatus };

const statuses: OrderStatus[] = [
  "Pending",
  "Processing",
  "Packed",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Shared customer orders cannot be loaded.");
      setLoading(false);
      return;
    }
    const { data: orderRows, error: orderError } = await supabase
      .from("customer_orders")
      .select("id,order_number,tracking_code,order_type,customer_name,phone,address,city,delivery_area,fulfillment_method,preferred_courier,payment_method,payment_status,subtotal,delivery,total,status,created_at")
      .order("created_at", { ascending: false })
      .returns<OrderRow[]>();
    if (orderError) {
      setError(`Could not load shared customer orders: ${orderError.message}`);
      setLoading(false);
      return;
    }
    if (orderRows.length === 0) {
      setOrders([]);
      setError("");
      setLoading(false);
      return;
    }
    const { data: itemRows, error: itemError } = await supabase
      .from("customer_order_items")
      .select("id,order_id,product_id,product_name,product_slug,product_image,unit_price,quantity")
      .in("order_id", orderRows.map((order) => order.id))
      .order("id")
      .returns<OrderItemRow[]>();
    if (itemError) {
      setError(`Could not load customer order items: ${itemError.message}`);
      setLoading(false);
      return;
    }
    setOrders(orderRows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      trackingCode: row.tracking_code,
      orderType: row.order_type,
      customer: {
        name: row.customer_name,
        phone: row.phone,
        address: row.address,
        city: row.city,
        area: row.delivery_area,
        payment: row.payment_method,
        fulfillmentMethod: row.fulfillment_method,
        courierPreference: row.preferred_courier,
      },
      items: itemRows
        .filter((item) => item.order_id === row.id)
        .map((item) => ({
          product: {
            id: item.product_id ?? 0,
            name: item.product_name,
            price: Number(item.unit_price),
            slug: item.product_slug,
            image: item.product_image,
          },
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
        })),
      subtotal: Number(row.subtotal),
      delivery: row.delivery === null ? null : Number(row.delivery),
      total: row.total === null ? null : Number(row.total),
      paymentStatus: row.payment_status,
      status: row.status,
      createdAt: row.created_at,
    })));
    setError("");
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadOrders);
  }, [loadOrders]);

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) =>
      `${order.trackingCode} ${order.orderNumber} ${order.customer.name} ${order.customer.phone}`
        .toLowerCase()
        .includes(query)
    );
  }, [orders, search]);

  async function changeStatus(order: AdminOrder, status: OrderStatus) {
    setBusyId(order.id);
    setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Order status was not changed.");
      setBusyId(null);
      return;
    }
    const { error: updateError } = await supabase
      .from("customer_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (updateError) {
      setError(`Could not update order ${order.orderNumber}: ${updateError.message}`);
      setBusyId(null);
      return;
    }
    await loadOrders();
    setBusyId(null);
  }

  async function changePaymentStatus(order: AdminOrder, paymentStatus: PaymentStatus) {
    setBusyId(order.id);
    setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Payment status was not changed.");
      setBusyId(null);
      return;
    }
    const { error: updateError } = await supabase
      .from("customer_orders")
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (updateError) {
      setError(`Could not update payment status for order ${order.orderNumber}: ${updateError.message}`);
      setBusyId(null);
      return;
    }
    await loadOrders();
    setBusyId(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">Store operations</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Orders</h1>
            <p className="mt-2 text-sm text-slate-600">Shared orders placed by customers from any device.</p>
          </div>
          <label className="w-full sm:max-w-sm">
            <span className="sr-only">Search customer orders</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer or phone"
              className="ui-field"
            />
          </label>
        </div>

        {error && <p role="alert" className="ui-feedback ui-feedback--error mt-5">{error}</p>}
        {loading ? (
          <p role="status" className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Loading shared orders…</p>
        ) : visibleOrders.length === 0 ? (
          <section className="ui-card mt-6 px-6 py-14 text-center">
            <h2 className="text-xl font-black">{orders.length ? "No matching orders" : "No customer orders yet"}</h2>
            <p className="mt-2 text-sm text-slate-600">{orders.length ? "Try another order number, customer name or phone." : "Orders submitted through checkout will appear here."}</p>
            <Link href="/search" className="ui-button-primary mt-5">Browse the catalog</Link>
          </section>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleOrders.map((order) => (
              <article key={order.id} className="ui-card p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-label text-slate-500">Order</p>
                    <h2 className="mt-1 text-xl font-black">Tracking code: {order.trackingCode}</h2>
                    <p className="mt-1 text-xs text-slate-500">Internal reference: {order.orderNumber}</p>
                    <p className="mt-2 text-sm text-slate-600">{order.customer.name} · {order.customer.phone}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.customer.fulfillmentMethod === "store_pickup"
                        ? "Store pickup — confirm pickup address and readiness with customer."
                        : `${order.customer.address}, ${order.customer.area}, ${order.customer.city}`}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.customer.fulfillmentMethod === "store_pickup"
                        ? "Fulfillment: Store pickup"
                        : `Preferred courier: ${order.customer.courierPreference ? courierPreferenceLabel(order.customer.courierPreference) : "Not specified"}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString("en-PK")}</p>
                    <Link href={`/track-order?order=${encodeURIComponent(order.trackingCode)}`} className="mt-2 inline-block text-sm font-bold text-lime-700">Tracking page →</Link>
                  </div>
                  <label className="text-sm font-bold text-slate-700">
                    Status
                    <select
                      value={order.status}
                      disabled={busyId === order.id}
                      onChange={(event) => void changeStatus(order, event.target.value as OrderStatus)}
                      className="ui-field mt-2 min-w-44"
                    >
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-slate-700">
                    Payment status
                    <select
                      value={order.paymentStatus}
                      disabled={busyId === order.id}
                      onChange={(event) => void changePaymentStatus(order, event.target.value as PaymentStatus)}
                      className="ui-field mt-2 min-w-44"
                    >
                      {(["Unpaid", "Paid", "Refunded"] as const).map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
                <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                  {order.items.map((item, index) => (
                    <div key={`${order.id}-${index}`} className="flex justify-between gap-4 py-3 text-sm">
                      <span className="text-slate-700">{item.product.name} × {item.quantity}</span>
                      <span className="shrink-0 font-bold text-slate-900">Rs. {(item.unitPrice * item.quantity).toLocaleString("en-PK")}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                  <div className="text-sm text-slate-600">
                    <p>Payment method: {order.customer.payment}</p>
                    <p className="mt-1">Payment status: {order.paymentStatus}</p>
                    <p className="mt-1">Delivery: {order.delivery === null ? "To be confirmed" : `Rs. ${order.delivery.toLocaleString("en-PK")}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Order total</p>
                    <p className="mt-1 text-xl font-black">{order.total === null ? `Subtotal Rs. ${order.subtotal.toLocaleString("en-PK")} (delivery not included)` : `Rs. ${order.total.toLocaleString("en-PK")}`}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
