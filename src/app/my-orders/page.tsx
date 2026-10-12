"use client";

import Link from "next/link";
import { useState } from "react";
import { normalizeSavedOrder, type SavedOrder } from "@/lib/orders";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function MyOrdersPage() {
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function findOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearched(true);
    setError("");
    setOrder(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 11 || !digits.startsWith("03")) {
      setError("Enter the Pakistani mobile number used at checkout.");
      return;
    }
    const normalizedOrderNumber = orderNumber.trim();
    if (!/^(?:\d{6}|UMP-[A-F0-9]{12})$/i.test(normalizedOrderNumber)) {
      setError("Enter the six-digit tracking code from your checkout confirmation.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Order lookup is not configured. Please contact the store.");
      return;
    }
    setLoading(true);
    const { data, error: queryError } = await supabase.rpc("track_customer_order", {
      p_order_number: normalizedOrderNumber,
      p_phone: digits,
    });
    if (queryError) {
      setError(`Could not find your order: ${queryError.message}`);
      setLoading(false);
      return;
    }
    const savedOrder = normalizeSavedOrder(data);
    if (!savedOrder) {
      setError("No order matched both details. Check the order number and checkout phone.");
      setLoading(false);
      return;
    }
    setOrder(savedOrder);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-orange-600 transition hover:text-orange-700">← Home</Link>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">Customer orders</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Find My Order</h1>
          <p className="mt-3 text-slate-500">For your privacy, look up an order using both its confirmation number and checkout phone number.</p>
          <form onSubmit={findOrder} className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="text-sm font-bold text-slate-700">
              Order number
              <input required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="123456" inputMode="numeric" maxLength={16} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Checkout phone
              <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="03XXXXXXXXX" inputMode="tel" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500" />
            </label>
            <button disabled={loading} className="rounded-xl bg-orange-500 px-6 py-3 font-black text-white transition hover:bg-orange-600 disabled:opacity-60">
              {loading ? "Searching…" : "Find Order"}
            </button>
          </form>
          {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</p>}
          {searched && !loading && !error && !order && (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">No order matched those details.</p>
          )}
          {order && (
            <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Order</p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">#{order.trackingCode ?? order.orderNumber}</h2>
                  <p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString("en-PK")}</p>
                </div>
                <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-orange-700">{order.status}</span>
              </div>
              <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                {order.items.map((item, index) => (
                  <div key={`${order.orderNumber}-${index}`} className="flex items-center justify-between gap-3 text-sm text-slate-600">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span className="font-bold text-slate-900">Rs. {(item.unitPrice * item.quantity).toLocaleString("en-PK")}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">
                Payment: {order.customer.payment} · {order.paymentStatus ?? "Unpaid"}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <p className="text-xl font-black text-slate-900">{order.total == null ? "Delivery to be confirmed" : `Rs. ${order.total.toLocaleString("en-PK")}`}</p>
                <Link href={`/track-order?order=${encodeURIComponent(order.trackingCode ?? order.orderNumber)}`} className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white transition hover:bg-slate-800">Track Order Status</Link>
              </div>
            </article>
          )}
        </div>
      </div>
    </main>
  );
}
