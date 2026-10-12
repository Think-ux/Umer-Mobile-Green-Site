"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<main className="p-8 text-center text-slate-500">Loading order details…</main>}>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const isTrackingCode = Boolean(orderNumber && /^\d{6}$/.test(orderNumber));

  if (!orderNumber || (!isTrackingCode && !/^UMP-[A-F0-9]{12}$/i.test(orderNumber))) {
    return (
      <main className="min-h-[65vh] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <section className="ui-card mx-auto max-w-2xl p-7 text-center sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Order information</p>
          <h1 className="mt-3 text-3xl font-black">We couldn&apos;t verify an order</h1>
          <p role="status" className="mt-4 leading-7 text-slate-600">
            We could not find an order tracking code in this link. You can still look up an order using its six-digit tracking code and checkout phone.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/my-orders" className="ui-button-primary">Find my orders</Link>
            <Link href="/search" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-bold hover:border-orange-300 hover:text-orange-700">
              Continue shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[32px] border border-green-100 bg-white p-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl font-black text-green-700">
            ✓
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.22em] text-green-700">Order received</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Thank you for your order
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
            Your order has been recorded in the store’s shared order system. Keep this tracking code; payment and delivery arrangements will be confirmed by the store.
          </p>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-left">
            <p className="text-slate-600">{isTrackingCode ? "Your 6-digit tracking code" : "Legacy order number"}</p>
            <p className="mt-2 break-all text-2xl font-black text-slate-900">{orderNumber}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">Track your order by entering this code and the same phone number you used at checkout.</p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/search" className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-slate-900 px-6 py-3 font-black text-slate-900 transition hover:bg-slate-900 hover:text-white">
              Continue shopping
            </Link>
            <Link href={`/track-order?order=${encodeURIComponent(orderNumber)}`} className="ui-button-primary">
              Track order
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
