"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  emptySnapshot,
  readStorage,
  subscribeToStorage,
  writeStorage,
} from "@/lib/storage";
import { LAST_ORDER_EVENT, LAST_ORDER_KEY, ORDERS_EVENT, ORDERS_KEY } from "@/lib/orders";

type OrderItem = {
  product: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
};

type Order = {
  orderNumber: string;
  orderType?: "customer" | "retailer";
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    payment: string;
    shopName?: string;
  };
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  status: string;
  paymentStatus?: string;
  createdAt: string;
};

const orderStatuses = [
  "Pending",
  "Processing",
  "Packed",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

const paymentStatuses = [
  "Unpaid",
  "Paid",
  "Partial",
  "Refunded",
];

const money = (amount: number) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

const subscribeOrders = subscribeToStorage(ORDERS_EVENT);

function parseOrders(raw: string): Order[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export default function AdminOrders() {
  const raw = useSyncExternalStore(
    subscribeOrders,
    () => readStorage(ORDERS_KEY),
    emptySnapshot
  );
  const orders = useMemo(() => parseOrders(raw), [raw]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  function saveOrders(updated: Order[]) {
    try {
      writeStorage(ORDERS_KEY, JSON.stringify(updated), ORDERS_EVENT);

      const lastRaw = readStorage(LAST_ORDER_KEY);
      if (lastRaw) {
        const last = JSON.parse(lastRaw) as Order;
        const changed = updated.find(
          (order) => order.orderNumber === last.orderNumber
        );
        if (changed) {
          writeStorage(
            LAST_ORDER_KEY,
            JSON.stringify(changed),
            LAST_ORDER_EVENT
          );
        }
      }
    } catch {
      window.alert("Could not save changes in browser storage.");
    }
  }

  function updateOrder(
    orderNumber: string,
    changes: Partial<Order>
  ) {
    saveOrders(
      orders.map((order) =>
        order.orderNumber === orderNumber
          ? { ...order, ...changes }
          : order
      )
    );
  }

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const type = order.orderType || "customer";
      const matchesType = filter === "all" || type === filter;
      const matchesSearch =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.customer?.phone?.includes(term) ||
        order.customer?.city?.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [orders, filter, search]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    processing: orders.filter(
      (o) => ["Processing", "Packed", "Dispatched"].includes(o.status)
    ).length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    revenue: orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + Number(o.total || 0), 0),
  }), [orders]);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:ml-64 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-orange-500">
              Umer Mobile Parts
            </p>
            <h1 className="mt-1 text-3xl font-black">Order Processing</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage customer and retailer orders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl border bg-white px-4 py-3 font-bold"
          >
            Refresh Orders
          </button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["All Orders", stats.total],
            ["Pending", stats.pending],
            ["In Progress", stats.processing],
            ["Delivered", stats.delivered],
            ["Order Value", money(stats.revenue)],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border bg-white p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-7 rounded-2xl border bg-white p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number, name, phone or city"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
            />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border px-4 py-3"
            >
              <option value="all">All order types</option>
              <option value="customer">Customer orders</option>
              <option value="retailer">Retailer orders</option>
            </select>
          </div>
        </section>

        {filteredOrders.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-dashed bg-white p-12 text-center">
            <div className="text-4xl">📦</div>
            <h2 className="mt-4 text-xl font-black">No matching orders</h2>
            <p className="mt-2 text-sm text-slate-500">
              Orders saved by checkout in this browser will appear here.
            </p>
          </section>
        ) : (
          <div className="mt-6 space-y-5">
            {filteredOrders.map((order) => (
              <article
                key={order.orderNumber}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 border-b p-5 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black">
                        #{order.orderNumber}
                      </h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${
                        order.orderType === "retailer"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {order.orderType === "retailer"
                          ? "Retailer Order"
                          : "Customer Order"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                        {order.status || "Pending"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-bold text-slate-500">
                      ORDER STATUS
                      <select
                        value={order.status || "Pending"}
                        onChange={(event) =>
                          updateOrder(order.orderNumber, {
                            status: event.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-xl border p-3 text-sm font-bold text-slate-900"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-bold text-slate-500">
                      PAYMENT STATUS
                      <select
                        value={order.paymentStatus || "Unpaid"}
                        onChange={(event) =>
                          updateOrder(order.orderNumber, {
                            paymentStatus: event.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-xl border p-3 text-sm font-bold text-slate-900"
                      >
                        {paymentStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="grid gap-6 p-5 md:grid-cols-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Customer / Retailer
                    </h3>
                    <p className="mt-2 font-bold">
                      {order.customer?.name || "Name unavailable"}
                    </p>
                    {order.customer?.shopName && (
                      <p className="text-sm text-purple-700">
                        Shop: {order.customer.shopName}
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      {order.customer?.phone || "No phone"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Delivery Details
                    </h3>
                    <p className="mt-2 font-bold">
                      {order.customer?.city || "City unavailable"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.customer?.address || "Address unavailable"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Payment & Total
                    </h3>
                    <p className="mt-2 font-bold">
                      {order.customer?.payment || "Payment not specified"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Payment: {order.paymentStatus || "Unpaid"}
                    </p>
                    <p className="mt-2 text-xl font-black text-orange-600">
                      {money(order.total)}
                    </p>
                  </div>
                </div>

                <div className="border-t bg-slate-50 p-5">
                  <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    Products
                  </h3>
                  <div className="space-y-2">
                    {(order.items || []).map((item, index) => (
                      <div
                        key={`${item.product?.id ?? index}-${index}`}
                        className="flex justify-between gap-4 rounded-xl bg-white p-3 text-sm"
                      >
                        <span className="font-semibold">
                          {item.product?.name || "Product"} × {item.quantity}
                        </span>
                        <span className="whitespace-nowrap font-bold">
                          {money(Number(item.product?.price || 0) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold">{money(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="font-bold">{money(order.delivery)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="font-black">Total</span>
                      <span className="font-black">{money(order.total)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="mt-6 text-center text-xs text-slate-400">
          Local demo: orders are stored in this browser only. This is not a shared production database.
        </p>
      </div>
    </main>
  );
}
