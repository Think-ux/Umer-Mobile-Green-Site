import Link from "next/link";

export default function RetailerOrdersPage() {
  return (
    <main className="min-h-page-content bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">
          Retailer orders
        </p>
        <h1 className="mt-3 text-3xl font-black">
          Wholesale ordering is not enabled yet
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          The store has not confirmed retailer prices and ordering terms.
          Retailer orders are not being accepted or stored yet. Apply for
          retailer access or contact the store before placing a wholesale order.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/retailer" className="ui-button-primary">
            Retailer information
          </Link>
          <Link
            href="/customer-care"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-bold hover:border-lime-300 hover:text-lime-800"
          >
            Contact the store
          </Link>
        </div>
      </section>
    </main>
  );
}
