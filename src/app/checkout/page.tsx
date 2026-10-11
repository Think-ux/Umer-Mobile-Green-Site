"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useCatalog } from "@/components/CatalogProvider";
import {
  normalizeSavedOrder,
} from "@/lib/orders";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type CustomerForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
  payment: string;
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading checkout...</main>}>
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const { items: cartItems, clearCart } = useCart();
  const { settings } = useCatalog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const retailerCheckout = searchParams.get("type") === "retailer";
  const items = cartItems;
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const delivery = settings.deliveryCharge !== null &&
    settings.freeDeliveryThreshold !== null
    ? subtotal > 0 &&
      subtotal < settings.freeDeliveryThreshold
      ? settings.deliveryCharge
      : 0
    : null;
  const total = delivery === null ? null : subtotal + delivery;

  const [form, setForm] = useState<CustomerForm>({
    name: "",
    phone: "",
    address: "",
    city: "",
    payment: "To be confirmed with the store",
  });

  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  function updateField(
    field: keyof CustomerForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (placing) {
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const name = form.name.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();
    const city = form.city.trim();

    if (name.length < 3) {
      setError("Please enter your full name.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (
      phoneDigits.length !== 11 ||
      !phoneDigits.startsWith("03")
    ) {
      setError("Please enter a valid Pakistani phone number, e.g. 03001234567.");
      return;
    }

    if (address.length < 10) {
      setError("Please enter your complete delivery address.");
      return;
    }

    if (city.length < 2) {
      setError("Please enter your city.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setPlacing(false);
      setError("Order service is not configured. Please contact the store; your order was not placed.");
      return;
    }

    setPlacing(true);
    const { data, error: createError } = await supabase.rpc("create_customer_order", {
      p_name: name,
      p_phone: phone,
      p_address: address,
      p_city: city,
      p_items: items.map(({ product, quantity }) => ({
        product_id: product.id,
        quantity,
      })),
    });
    if (createError) {
      setPlacing(false);
      setError(`Order was not placed: ${createError.message}`);
      return;
    }

    const order = normalizeSavedOrder(data);
    if (!order) {
      setPlacing(false);
      setError("The store saved a response we could not verify. Contact the store with your phone number before retrying.");
      return;
    }
    clearCart();
    router.push(`/order-confirmation?order=${encodeURIComponent(order.orderNumber)}`);
  }

  if (retailerCheckout) {
    return (
      <main className="min-h-[65vh] bg-slate-50 px-4 py-16">
        <section className="ui-card mx-auto max-w-2xl p-7 text-center sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Retailer ordering</p>
          <h1 className="mt-3 text-3xl font-black">Wholesale checkout is not available yet</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Retailer pricing and ordering terms have not been confirmed. No wholesale discount has been applied. Contact the store to discuss approved terms, or browse the catalog at its listed prices.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/retailer" className="ui-button-primary">Retailer information</Link>
            <Link href="/search" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-bold hover:border-orange-300 hover:text-orange-700">
              Browse listed prices
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-2xl">
            Cart
          </div>

          <h1 className="mt-6 text-3xl font-black">
            Your cart is empty
          </h1>

          <p className="mt-3 text-slate-500">
            Add products before continuing to checkout.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-black text-white hover:bg-orange-600"
          >
            Start Shopping
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">
            Secure checkout
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Review Your Order</h1>
          <p className="mt-2 text-slate-500">
            Enter your delivery details to submit your order to the store.
          </p>
        </div>

        <form noValidate onSubmit={submitOrder} className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Customer Information</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Your full name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">Phone Number</label>
                  <input
                    inputMode="numeric"
                    maxLength={11}
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    placeholder="03001234567"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Delivery Address</label>
                  <textarea
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="House / Shop / Street / Area"
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">City</label>
                  <input
                    required
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    placeholder="Enter your city"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Payment</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Payment will be confirmed with the store. Submitting this order records your request; it does not process a payment.
              </p>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Your Order</h2>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-600">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="whitespace-nowrap font-bold text-slate-900">
                    Rs. {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">Rs. {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-bold text-slate-900">
                  {delivery === null ? "To be confirmed" : delivery === 0 ? "FREE" : `Rs. ${delivery.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-4">
                <span className="font-black text-slate-900">{total === null ? "Subtotal before delivery" : "Total"}</span>
                <span className="text-2xl font-black text-slate-900">
                  {total === null ? `Rs. ${subtotal.toLocaleString()}` : `Rs. ${total.toLocaleString()}`}
                </span>
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={placing}
              className="mt-7 w-full rounded-xl bg-orange-500 px-6 py-4 font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? "Submitting…" : "Place order"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Your order will be stored securely so you can track it from any device.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
