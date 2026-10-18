"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { courierPreferenceLabel, normalizeSavedOrder, type SavedOrder } from "@/lib/orders";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type StatusEvent = { status: string; createdAt: string };
type TrackedOrder = SavedOrder & { statusHistory: StatusEvent[] };

const steps = ["Pending", "Processing", "Packed", "Dispatched", "Delivered"];

export default function TrackOrderPage() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const initialOrder = new URLSearchParams(window.location.search).get("order");
      if (initialOrder) setNumber(initialOrder);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function track(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setOrder(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 11 || !digits.startsWith("03")) {
      setError("Enter the Pakistani mobile number used when placing the order.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Order tracking is not configured. Please contact the store.");
      return;
    }
    setLoading(true);
    const { data, error: trackError } = await supabase.rpc("track_customer_order", {
      p_order_number: number.trim(),
      p_phone: digits,
    });
    if (trackError) {
      setError(`Could not check order status: ${trackError.message}`);
      setLoading(false);
      return;
    }
    const savedOrder = normalizeSavedOrder(data);
    if (!savedOrder) {
      setError("Order not found. Check the order number and checkout phone number.");
      setLoading(false);
      return;
    }
    const historyValue =
      data && typeof data === "object" && "statusHistory" in data
        ? data.statusHistory
        : [];
    const statusHistory = Array.isArray(historyValue)
      ? historyValue.filter(
          (entry): entry is StatusEvent =>
            !!entry &&
            typeof entry === "object" &&
            "status" in entry &&
            typeof entry.status === "string" &&
            "createdAt" in entry &&
            typeof entry.createdAt === "string"
        )
      : [];
    setOrder({ ...savedOrder, statusHistory });
    setLoading(false);
  }

  const status = order?.status || "Pending";
  const index = steps.indexOf(status);
  const isCancelled = status === "Cancelled";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-lime-700 transition hover:text-lime-800">
          ← Home
        </Link>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-eyebrow-wide text-lime-700">Live order status</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Track Your Order</h1>
          <p className="mt-3 text-slate-500">Enter the order number and checkout phone number to check its latest status from the store.</p>
          <form onSubmit={track} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <label className="block text-sm font-bold text-slate-700">
              6-digit tracking code
              <input required value={number} onChange={(event) => setNumber(event.target.value)} placeholder="123456" inputMode="numeric" maxLength={16} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Phone Number
              <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="03XXXXXXXXX" inputMode="tel" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary" />
            </label>
            <button disabled={loading} className="w-full rounded-xl bg-brand-primary px-6 py-4 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover disabled:opacity-60">
              {loading ? "Checking…" : "Check Order Status"}
            </button>
          </form>
          {error && <p role="alert" className="ui-feedback ui-feedback--error mt-4">{error}</p>}
          {order && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-eyebrow text-slate-400">Order Status</p>
              <h2 className="mt-2 break-all text-xl font-black text-slate-900">#{order.trackingCode ?? order.orderNumber}</h2>
              <p className={`mt-3 text-2xl font-black ${isCancelled ? "text-red-600" : "text-lime-700"}`}>{status}</p>
              {isCancelled ? (
                <p className="mt-4 rounded-xl bg-red-50 p-4 font-bold text-red-700">This order has been cancelled. Contact the store for details.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {steps.map((step, stepIndex) => {
                    const event = order.statusHistory.find((item) => item.status === step);
                    const complete = index >= 0 && stepIndex <= index;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full font-black ${complete ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400"}`}>{complete ? "✓" : stepIndex + 1}</span>
                        <span className={complete ? "font-bold text-slate-900" : "text-slate-400"}>{step}</span>
                        {event && <time className="ml-auto text-xs text-slate-500">{new Date(event.createdAt).toLocaleString("en-PK")}</time>}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
                <p>Customer: {order.customer.name}</p>
                <p className="mt-2">Payment: {order.customer.payment} · {order.paymentStatus ?? "Unpaid"}</p>
                <p className="mt-2">
                  {order.customer.fulfillmentMethod === "store_pickup"
                    ? "Fulfillment: Store pickup. Please wait for the store to confirm pickup address and readiness before travelling."
                    : `Delivery service: ${order.customer.courierPreference ? `${courierPreferenceLabel(order.customer.courierPreference)} (subject to store confirmation)` : "To be confirmed with the store"}`}
                </p>
                {order.customer.fulfillmentMethod !== "store_pickup" && (
                  <p className="mt-2">Delivery address: {order.customer.address}, {order.customer.area}, {order.customer.city}</p>
                )}
                <p className="mt-2 font-black text-slate-900">Total: {order.total == null ? "To be confirmed" : `Rs. ${order.total.toLocaleString("en-PK")}`}</p>
                <p className="mt-2">Placed: {new Date(order.createdAt).toLocaleString("en-PK")}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
