"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { LAST_ORDER_EVENT, LAST_ORDER_KEY } from "@/lib/orders";
import {
  emptySnapshot,
  readStorage,
  subscribeToStorage,
} from "@/lib/storage";

type Order = {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    payment: string;
  };
  total: number;
};

const subscribeLastOrder = subscribeToStorage(LAST_ORDER_EVENT);

function parseLastOrder(raw: string): Order | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

export default function OrderConfirmationPage() {
  const raw = useSyncExternalStore(
    subscribeLastOrder,
    () => readStorage(LAST_ORDER_KEY),
    emptySnapshot
  );
  const order = useMemo(() => parseLastOrder(raw), [raw]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">

        <div className="rounded-3xl bg-white p-7 text-center shadow-sm md:p-12">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
            ✓
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-widest text-green-600">
            Order Confirmed
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Thank you for your order!
          </h1>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">
            Your order has been successfully placed. We will process
            your order and contact you using the provided phone number.
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-left">

            <div className="flex justify-between gap-4 border-b pb-4">
              <span className="text-slate-500">
                Order Number
              </span>

              <span className="font-black">
                {order?.orderNumber || "UMP-DEMO"}
              </span>
            </div>

            {order && (
              <>
                <div className="flex justify-between gap-4 border-b py-4">
                  <span className="text-slate-500">
                    Customer
                  </span>

                  <span className="font-bold">
                    {order.customer.name}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
