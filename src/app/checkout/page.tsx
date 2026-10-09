"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { products } from "@/data/store";
import {
  LAST_ORDER_EVENT,
  LAST_ORDER_KEY,
  ORDERS_EVENT,
  ORDERS_KEY,
  createOrderNumber,
  nowIso,
} from "@/lib/orders";
import { readStorage, writeStorage } from "@/lib/storage";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderType =
    searchParams.get("type") === "retailer" ? "retailer" : "customer";
  const productId = Number(searchParams.get("product"));
  const retailerProductId =
    Number.isInteger(productId) && productId > 0 ? productId : null;

  const selectedRetailerProduct =
    orderType === "retailer" && retailerProductId !== null
      ? products.find((product) => product.id === retailerProductId)
      : undefined;

  const items =
    orderType === "retailer" && selectedRetailerProduct
      ? [{
          product: {
            ...selectedRetailerProduct,
            price: Math.round(selectedRetailerProduct.price * 0.82),
          },
          quantity: 1,
        }]
      : orderType === "retailer"
        ? cartItems.map((item) => ({
            ...item,
            product: {
              ...item.product,
              price: Math.round(item.product.price * 0.82),
            },
          }))
        : cartItems;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const delivery = subtotal > 0 ? 250 : 0;
  const total = subtotal + delivery;

  const [form, setForm] = useState<CustomerForm>({
    name: "",
    phone: "",
    address: "",
    city: "Lahore",
    payment: "Cash on Delivery",
  });

  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const [paymentReference, setPaymentReference] = useState("");
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

  function submitOrder(event: FormEvent<HTMLFormElement>) {
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

    setPlacing(true);

    const orderNumber = createOrderNumber();

    const order = {
      orderType,
      orderNumber,
      customer: {
        ...form,
        name,
        phone,
        address,
      },
      items,
      subtotal,
      delivery,
      total,
      status: "Pending",
      createdAt: nowIso(),
    };

    try {
      const existingOrdersRaw = readStorage(ORDERS_KEY);

      let existingOrders: unknown[] = [];

      if (existingOrdersRaw) {
        try {
          const parsed = JSON.parse(existingOrdersRaw);

          if (Array.isArray(parsed)) {
            existingOrders = parsed;
          }
        } catch {
          existingOrders = [];
        }
      }

      writeStorage(
        ORDERS_KEY,
        JSON.stringify([order, ...existingOrders]),
        ORDERS_EVENT
      );

      writeStorage(LAST_ORDER_KEY, JSON.stringify(order), LAST_ORDER_EVENT);

      if (orderType === "customer") clearCart();

      router.push(
        `/order-confirmation?order=${encodeURIComponent(orderNumber)}`
      );
    } catch {
      setPlacing(false);
      setError(
        "Unable to place the order right now. Please try again."
      );
    }
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
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-orange-500">
            Checkout
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Complete Your Order
          </h1>

          <p className="mt-2 text-slate-500">
            Enter your delivery details and choose a payment method.
          </p>
        </div>

        <form
          noValidate
          onSubmit={submitOrder}
          className="grid gap-8 lg:grid-cols-[1fr_360px]"
        >

          <div className="space-y-6">

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">
                Customer Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="text-sm font-bold">
                    Full Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Your full name"
                    className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Phone Number
                  </label>

                  <input
                    inputMode="numeric"
                    maxLength={11}
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value.replace(/\D/g, "").slice(0, 11)
                      )
                    }
                    placeholder="03001234567"
                    className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-bold">
                    Delivery Address
                  </label>

                  <textarea
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    placeholder="House / Shop / Street / Area"
                    rows={4}
                    className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    City
                  </label>

                  <select
                    value={form.city}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-orange-500"
                  >
                    <option>Lahore</option>
                    <option>Karachi</option>
                    <option>Islamabad</option>
                    <option>Rawalpindi</option>
                    <option>Faisalabad</option>
                    <option>Multan</option>
                    <option>Other</option>
                  </select>
                </div>

              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
  <h2 className="text-xl font-black">Payment Method</h2>

  <p className="mt-2 text-sm text-slate-500">
    Select your preferred payment method. Online payments require
    manual verification in this demo.
  </p>

  <div className="mt-5 space-y-3">
    {[
      "Cash on Delivery",
      "Bank Transfer",
      "JazzCash",
      "Easypaisa",
    ].map((method) => (
      <label
        key={method}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
          form.payment === method
            ? "border-orange-500 bg-orange-50"
            : "border-slate-200 hover:border-slate-400"
        }`}
      >
        <input
          type="radio"
          name="payment"
          value={method}
          checked={form.payment === method}
          onChange={(event) => {
            updateField("payment", event.target.value);
            setPaymentReference("");
          }}
          className="accent-orange-500"
        />

        <span className="font-bold">{method}</span>

        <span className="ml-auto text-xs text-slate-500">
          {method === "Cash on Delivery" ? "Pay on delivery" : "Manual payment"}
        </span>
      </label>
    ))}
  </div>

  {form.payment === "Cash on Delivery" ? (
    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
      <p className="font-black text-green-800">
        Cash on Delivery selected
      </p>
      <p className="mt-1 text-sm text-green-700">
        Pay the delivery person when your order arrives.
        No advance payment is required for this demo.
      </p>
    </div>
  ) : (
    <div className="mt-5 rounded-xl border bg-slate-50 p-5">
      <h3 className="font-black">{form.payment} Instructions</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Transfer the payment using the official account details
        provided by Umer Mobile Parts. Enter your transaction ID
        below after making the transfer.
      </p>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-bold text-amber-900">
          Merchant details required
        </p>
        <p className="mt-1 text-sm text-amber-800">
          Add your verified {form.payment} merchant account number
          and account title here before accepting real payments.
          Do not use placeholder account details.
        </p>
      </div>

      <label className="mt-5 block text-sm font-bold">
        Transaction ID / Reference (optional for demo)
        <input
          value={paymentReference}
          onChange={(event) => setPaymentReference(event.target.value)}
          placeholder="Enter transaction reference"
          maxLength={100}
          className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-orange-500"
        />
      </label>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Entering a reference does not confirm payment. Admin must
        verify the transaction and update the payment status.
      </p>
    </div>
  )}
</section>

          </div>

          <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-black">
              Your Order
            </h2>

            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span className="text-slate-600">
                    {item.product.name} Ã— {item.quantity}
                  </span>

                  <span className="whitespace-nowrap font-bold">
                    Rs.{" "}
                    {(
                      item.product.price *
                      item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t pt-5">

              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-bold">
                  Rs. {delivery.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between border-t pt-4">
                <span className="font-black">
                  Total
                </span>

                <span className="text-2xl font-black">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={placing}
              className="mt-7 w-full rounded-xl bg-orange-500 px-6 py-4 font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? "Placing Order..." : "Place Order"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Your order details are saved locally for this demo.
            </p>

          </aside>

        </form>
      </div>
    </main>
  );
}




