"use client";
import Link from "next/link";
import { useState } from "react";

type Order = {
  orderNumber: string;
  orderType?: string;
  customer?: { name?: string; phone?: string };
  items?: { product?: { id?: number; name?: string; price?: number }; quantity?: number }[];
  total?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
};

export default function MyOrdersPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  function searchOrders(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearched(true);
    setError("");
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10) {
      setOrders([]);
      setError("Please enter your checkout phone number.");
      return;
    }

    try {
      const raw = localStorage.getItem("umer-orders");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const all: Order[] = Array.isArray(parsed) ? parsed : [];
      setOrders(all.filter(o =>
        (o.orderType || "customer") === "customer" &&
        o.customer?.phone?.replace(/\D/g, "") === digits
      ));
    } catch {
      setOrders([]);
      setError("Could not read saved orders.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-bold text-orange-600">← Home</Link>
        <h1 className="mt-5 text-3xl font-black">My Orders</h1>
        <p className="mt-2 text-slate-500">Enter the phone number used at checkout.</p>

        <form onSubmit={searchOrders} className="mt-6 flex flex-col gap-3 rounded-2xl border bg-white p-5 sm:flex-row">
          <input required value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="03XXXXXXXXX" inputMode="tel"
            className="min-w-0 flex-1 rounded-xl border px-4 py-3" />
          <button className="rounded-xl bg-orange-500 px-6 py-3 font-black text-white">
            Find My Orders
          </button>
        </form>

        {error && <p className="mt-4 text-red-600">{error}</p>}
        {searched && !error && orders.length === 0 && (
          <p className="mt-6 rounded-xl border bg-white p-6">No customer orders found.</p>
        )}

        <div className="mt-6 space-y-4">
          {orders.map(order => (
            <article key={order.orderNumber} className="rounded-2xl border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">#{order.orderNumber}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-4 py-2 font-bold text-orange-700">
                  {order.status || "Pending"}
                </span>
              </div>
              <div className="mt-4 space-y-2 border-t pt-4">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between gap-3 text-sm">
                    <span>{item.product?.name || "Product"} × {item.quantity}</span>
                    <span>Rs. {((item.product?.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div>
                  <p className="text-sm text-slate-500">Payment: {order.paymentStatus || "Unpaid"}</p>
                  <p className="mt-1 text-xl font-black">Rs. {(order.total || 0).toLocaleString()}</p>
                </div>
                <Link href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                  className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">
                  Track Order
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
