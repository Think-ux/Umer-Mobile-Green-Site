"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type Order = {
  orderNumber: string;
  orderType?: string;
  customer?: { phone?: string };
  status?: string;
  paymentStatus?: string;
  total?: number;
  createdAt?: string;
};

const steps = ["Pending", "Processing", "Packed", "Dispatched", "Delivered"];

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
const [number, setNumber] = useState(searchParams.get("order") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  function track(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOrder(null);

    try {
      const raw = localStorage.getItem("umer-orders");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const all: Order[] = Array.isArray(parsed) ? parsed : [];
      const digits = phone.replace(/\D/g, "");

      const found = all.find(o =>
        o.orderNumber.toLowerCase() === number.trim().toLowerCase() &&
        o.customer?.phone?.replace(/\D/g, "") === digits
      );

      if (found) setOrder(found);
      else setError("Order not found. Check the order number and phone number.");
    } catch {
      setError("Could not read saved orders.");
    }
  }

  const status = order?.status || "Pending";
  const index = steps.indexOf(status);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="font-bold text-orange-600">← Home</Link>
        <h1 className="mt-5 text-3xl font-black">Track Your Order</h1>
        <p className="mt-2 text-slate-500">Enter order number and checkout phone number.</p>

        <form onSubmit={track} className="mt-6 space-y-4 rounded-2xl border bg-white p-5">
          <div>
            <label className="text-sm font-bold">Order Number</label>
            <input required value={number} onChange={e => setNumber(e.target.value)}
              placeholder="UMP-12345678" className="mt-2 w-full rounded-xl border px-4 py-3" />
          </div>
          <div>
            <label className="text-sm font-bold">Phone Number</label>
            <input required value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="03XXXXXXXXX" inputMode="tel"
              className="mt-2 w-full rounded-xl border px-4 py-3" />
          </div>
          <button className="w-full rounded-xl bg-orange-500 px-6 py-4 font-black text-white">
            Check Order Status
          </button>
        </form>

        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}

        {order && (
          <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Order Status</p>
            <h2 className="mt-2 break-all text-xl font-black">#{order.orderNumber}</h2>
            <p className="mt-3 text-2xl font-black text-orange-600">{status}</p>

            {status === "Cancelled" ? (
              <p className="mt-4 rounded-xl bg-red-50 p-4 font-bold text-red-700">
                This order has been cancelled. Contact the store for details.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full font-black ${
                      index >= 0 && i <= index ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>{index >= 0 && i <= index ? "✓" : i + 1}</span>
                    <span className={index >= 0 && i <= index ? "font-bold" : "text-slate-400"}>{step}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t pt-4 text-sm">
              <p>Type: {order.orderType === "retailer" ? "Retailer" : "Customer"}</p>
              <p className="mt-2">Payment: {order.paymentStatus || "Unpaid"}</p>
              <p className="mt-2 font-black">Total: Rs. {(order.total || 0).toLocaleString()}</p>
              <p className="mt-2">Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Unknown"}</p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

