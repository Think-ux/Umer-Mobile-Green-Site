"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  hasRetailerDemoSession,
  isRetailerDemoEnabled,
} from "@/lib/auth/retailer-demo";
import { retailerDemoOrders } from "@/lib/auth/retailer-demo-data";

export default function RetailerOrdersPage() {
  const [demoSession, setDemoSession] = useState(false);
  const [checked, setChecked] = useState(false);
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        setDemoSession(isRetailerDemoEnabled() && hasRetailerDemoSession());
      } catch (error) {
        setAccessError(error instanceof Error ? error.message : "Could not verify retailer demo access.");
      } finally {
        setChecked(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!checked) {
    return (
      <main className="grid min-h-page-content place-items-center bg-slate-50 px-4 py-12">
        <p role="status" className="text-sm text-slate-600">Checking retailer demo access…</p>
      </main>
    );
  }

  if (accessError) {
    return (
      <main className="grid min-h-page-content place-items-center bg-slate-50 px-4 py-12">
        <section className="ui-card max-w-lg p-7 text-center">
          <h1 className="text-2xl font-black">Could not check demo access</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-red-700">{accessError}</p>
          <Link href="/retailer/login" className="ui-button-primary mt-5">Return to retailer sign in</Link>
        </section>
      </main>
    );
  }

  if (demoSession) {
    return (
      <main className="min-h-page-content bg-slate-50 px-4 py-12">
        <section className="mx-auto max-w-4xl">
          <Link href="/retailer/dashboard" className="text-sm font-bold text-lime-800 hover:text-lime-900">
            ← Retailer dashboard
          </Link>
          <div className="mt-5 rounded-3xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
            <p className="text-sm font-black uppercase tracking-wide">Demo mode · sample data only</p>
            <p className="mt-2 text-sm leading-6">
              These example orders are stored nowhere and are not real requests. Ordering and payment are disabled.
            </p>
          </div>
          <h1 className="mt-8 text-3xl font-black">Sample retailer orders</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Example statuses and item lists for reviewing the retailer experience.
          </p>
          <div className="mt-6 space-y-4">
            {retailerDemoOrders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">{order.id}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Example date: {new Date(`${order.createdAt}T12:00:00`).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {order.status}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.name}`} className="flex justify-between gap-4 text-sm text-slate-700">
                      <span>{item.name}</span><span className="font-bold">Qty {item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{order.note}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-black">Wholesale ordering is not enabled</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Demo mode lets you inspect sample order history only. It cannot submit orders, reserve stock, or record payments.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-page-content bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">Retailer orders</p>
        <h1 className="mt-3 text-3xl font-black">Wholesale ordering is not enabled yet</h1>
        <p className="mt-4 leading-7 text-slate-600">
          The store has not confirmed retailer prices and ordering terms. Retailer orders are not being accepted or stored yet. Apply for retailer access or contact the store before placing a wholesale order.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/retailer" className="ui-button-primary">Retailer information</Link>
          <Link href="/customer-care" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-bold hover:border-lime-300 hover:text-lime-800">
            Contact the store
          </Link>
        </div>
      </section>
    </main>
  );
}
