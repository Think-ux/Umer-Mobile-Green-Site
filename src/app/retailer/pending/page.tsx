import Link from "next/link";

export default function PendingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <section className="mx-auto max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/60 sm:p-10">
        <div
          aria-hidden="true"
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl font-black text-amber-700"
        >
          …
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-lime-700">
          Application status
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Application pending</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Your retailer application has been submitted successfully. Our team is reviewing your business information.
        </p>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-left">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-700">Status</span>
            <strong className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800">
              Pending review
            </strong>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The team will follow up using the email address or phone number you provided after reviewing your application.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/retailer/login"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-primary px-5 py-3 font-black text-brand-primary-foreground"
          >
            Retailer login
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-800 transition hover:border-lime-300 hover:text-lime-800"
          >
            Back to home →
          </Link>
        </div>
      </section>
    </main>
  );
}
