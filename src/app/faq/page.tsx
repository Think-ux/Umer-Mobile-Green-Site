"use client";

import Link from "next/link";
import { useState } from "react";
import { faqs } from "@/data/support";

export default function FaqPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">Help centre</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Frequently asked questions</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Answers about finding parts, checkout, order tracking and getting support.
        </p>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, index) => {
            const open = openFaq === index;
            const answerId = `faq-answer-${index}`;

            return (
              <section key={faq.question} className="ui-card overflow-hidden">
                <h2>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold"
                  >
                    {faq.question}
                    <span aria-hidden="true" className="text-xl text-orange-600">{open ? "−" : "+"}</span>
                  </button>
                </h2>
                {open && (
                  <p id={answerId} className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <Link href="/customer-care" className="mt-8 inline-flex font-bold text-orange-700 hover:text-orange-800">
          Need more help? Contact Customer Care
        </Link>
      </div>
    </main>
  );
}
