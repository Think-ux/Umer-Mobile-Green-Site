"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    delivery,
    total,
    itemCount,
  } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">

          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-widest text-orange-500">
              Shopping Cart
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Your Cart
            </h1>
          </div>

          <div className="rounded-3xl border bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-3xl">
              Cart
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Your cart is empty
            </h2>

            <p className="mt-2 text-slate-500">
              Add some mobile parts to continue shopping.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-orange-500 px-7 py-3 font-black text-white hover:bg-orange-600"
            >
              Start Shopping
            </Link>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-orange-500">
            Shopping Cart
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Your Cart
          </h1>

          <p className="mt-2 text-slate-500">
            {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row">

                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-28 w-full rounded-xl object-cover sm:w-28"
                  />

                  <div className="flex-1">

                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-orange-500">
                          {item.product.category}
                        </div>

                        <h2 className="mt-1 text-lg font-black">
                          {item.product.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.product.brand} · {item.product.model} · {item.product.quality}
                        </p>
                      </div>

                      <div className="text-lg font-black">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                      <div className="inline-flex overflow-hidden rounded-xl border">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="h-10 w-10 font-bold hover:bg-slate-50 disabled:opacity-30"
                        >
                          -
                        </button>

                        <div className="flex h-10 w-12 items-center justify-center border-x font-black">
                          {item.quantity}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="h-10 w-10 font-bold hover:bg-slate-50 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.product.id)
                        }
                        className="text-sm font-bold text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-black">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-bold">
                  {delivery === 0
                    ? "FREE"
                    : `Rs. ${delivery.toLocaleString()}`}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-black">
                    Total
                  </span>

                  <span className="text-2xl font-black">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            <Link
              href="/checkout"
              className="mt-7 block rounded-xl bg-orange-500 px-6 py-4 text-center font-black text-white hover:bg-orange-600"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="mt-3 block text-center text-sm font-bold text-slate-500 hover:text-orange-600"
            >
              Continue Shopping
            </Link>

          </aside>
        </div>
      </div>
    </main>
  );
}
