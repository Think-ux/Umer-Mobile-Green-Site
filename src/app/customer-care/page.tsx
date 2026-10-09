"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Choose your required mobile part, add it to your cart, then continue to checkout and enter your delivery details.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Keep your order number after checkout and contact Customer Care with your order number and phone number.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes. Cash on Delivery is available as a payment option during checkout.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Please contact Customer Care as soon as possible with your order number and product details. Return or exchange eligibility depends on the product and its condition.",
  },
  {
    question: "What if I receive a damaged or incorrect part?",
    answer:
      "Do not install the part. Contact Customer Care with your order number and clear photos of the received product and packaging.",
  },
];

export default function CustomerCarePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-950 px-4 py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
            Customer Care
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            How can we help you?
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Need help with an order, product, payment or delivery?
            Our Customer Care team is here to help.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-green-500 px-6 py-4 font-black text-white transition hover:bg-green-600"
            >
              WhatsApp Support
            </a>

            <a
              href="tel:+923001234567"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 px-6 py-4 font-black text-white transition hover:bg-white hover:text-slate-950"
            >
              Call Customer Care
            </a>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">

          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
              💬
            </div>

            <h2 className="mt-5 text-xl font-black">
              WhatsApp
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chat with us about your order or product.
            </p>

            <span className="mt-5 inline-block font-black text-green-600 group-hover:underline">
              Start Chat →
            </span>
          </a>

          <a
            href="tel:+923001234567"
            className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
              📞
            </div>

            <h2 className="mt-5 text-xl font-black">
              Call Us
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Speak directly with our Customer Care team.
            </p>

            <span className="mt-5 inline-block font-black text-orange-600 group-hover:underline">
              0300 1234567 →
            </span>
          </a>

          <a
            href="mailto:support@umermobileparts.com"
            className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              ✉️
            </div>

            <h2 className="mt-5 text-xl font-black">
              Email Support
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send us your question or order details.
            </p>

            <span className="mt-5 inline-block break-all font-black text-blue-600 group-hover:underline">
              support@umermobileparts.com
            </span>
          </a>

        </div>
      </section>

      {/* Help Topics */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <p className="text-sm font-black uppercase tracking-widest text-orange-500">
              Support Topics
            </p>

            <h2 className="mt-2 text-3xl font-black">
              What do you need help with?
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-2xl">📦</div>
              <h3 className="mt-4 font-black">My Order</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Questions about an existing order or delivery.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-2xl">🔄</div>
              <h3 className="mt-4 font-black">Return & Exchange</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Need help with a return or replacement?
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-2xl">💳</div>
              <h3 className="mt-4 font-black">Payment</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Help with payment methods and payment issues.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-2xl">🛠️</div>
              <h3 className="mt-4 font-black">Product Support</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Questions about displays, batteries or other parts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-7 text-center">
            <p className="text-sm font-black uppercase tracking-widest text-orange-500">
              FAQ
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-black">
                      {faq.question}
                    </span>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-black">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t px-5 pb-5 pt-4 text-sm leading-7 text-slate-500">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-orange-500 p-8 text-white md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">

            <div>
              <p className="text-sm font-black uppercase tracking-widest text-orange-100">
                Customer Care Hours
              </p>

              <h2 className="mt-2 text-3xl font-black">
                We&apos;re here to help
              </h2>

              <p className="mt-3 leading-7 text-orange-50">
                Contact us during our support hours for faster assistance.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <div className="flex justify-between border-b border-white/20 py-3">
                <span>Monday - Saturday</span>
                <span className="font-black">10 AM - 8 PM</span>
              </div>

              <div className="flex justify-between py-3">
                <span>Sunday</span>
                <span className="font-black">12 PM - 6 PM</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t bg-white px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black">
            Still need help?
          </h2>

          <p className="mt-3 text-slate-500">
            Our team is ready to assist you with your mobile parts order.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/search"
              className="rounded-xl border-2 border-slate-900 px-6 py-3 font-black transition hover:bg-slate-900 hover:text-white"
            >
              Browse Products
            </Link>

            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-green-500 px-6 py-3 font-black text-white transition hover:bg-green-600"
            >
              Chat on WhatsApp
            </a>

          </div>
        </div>
      </section>
    </main>
  );
}