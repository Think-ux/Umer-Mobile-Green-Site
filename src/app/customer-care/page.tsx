"use client";

import Link from "next/link";
import { useState } from "react";
import { useCatalog } from "@/components/CatalogProvider";
import { faqs } from "@/data/support";

export default function CustomerCarePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { settings } = useCatalog();
  const whatsapp = settings.whatsapp.replace(/\D/g, "");
  const phone = settings.phone;
  const hasContactMethod = Boolean(phone || settings.whatsapp || settings.supportEmail);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
            Customer Care
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            How can we help you?
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Need help with an order or product? Use a confirmed contact option below, or check the FAQs for current information.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {settings.whatsapp && <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-green-500 px-6 py-4 font-black text-white transition hover:bg-green-600"
            >
              WhatsApp Support
            </a>}

            {phone && <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-4 font-black text-white transition hover:bg-white hover:text-slate-950"
            >
              Call Customer Care
            </a>}

            {!hasContactMethod && (
              <p role="status" className="max-w-xl rounded-xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-slate-200">
                Store contact details are being confirmed. Use the FAQs for current information.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {settings.whatsapp && <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
              💬
            </div>

            <h2 className="mt-5 text-xl font-black">WhatsApp</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chat with us about your order or product.
            </p>
            <span className="mt-5 inline-block font-black text-green-600 group-hover:underline">
              Start Chat →
            </span>
          </a>}

          {phone && <a
            href={`tel:${phone}`}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
              📞
            </div>

            <h2 className="mt-5 text-xl font-black">Call Us</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Speak directly with our Customer Care team.
            </p>
            <span className="mt-5 inline-block font-black text-orange-600 group-hover:underline">
              {phone} →
            </span>
          </a>}

          {settings.supportEmail && <a
            href={`mailto:${settings.supportEmail}`}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              ✉️
            </div>

            <h2 className="mt-5 text-xl font-black">Email Support</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send us your question or order details.
            </p>
            <span className="mt-5 inline-block break-all font-black text-blue-600 group-hover:underline">
              {settings.supportEmail}
            </span>
          </a>}

          {!hasContactMethod && (
            <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950 md:col-span-3">
              Store contact methods have not been configured yet. Please use the FAQs and policy pages for information.
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">
              Support Topics
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">What do you need help with?</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["📦", "My Order", "Questions about an existing order or delivery."],
              ["🔄", "Return & Exchange", "Need help with a return or replacement?"],
              ["💳", "Payment", "Help with payment methods and payment issues."],
              ["🛠️", "Product Support", "Questions about displays, batteries or other parts."],
            ].map(([icon, title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-2xl">{icon}</div>
                <h3 className="mt-4 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-7 text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">FAQ</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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

      {/* Bottom CTA */}
      <section className="border-t bg-white px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black">
            Still need help?
          </h2>

          <p className="mt-3 text-slate-500">
            Review the FAQs or browse the available support options.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href="/search"
              className="rounded-xl border-2 border-slate-900 px-6 py-3 font-black transition hover:bg-slate-900 hover:text-white"
            >
              Browse Products
            </Link>

            {settings.whatsapp && <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-green-500 px-6 py-3 font-black text-white transition hover:bg-green-600"
            >
              Chat on WhatsApp
            </a>}

          </div>
        </div>
      </section>
    </main>
  );
}