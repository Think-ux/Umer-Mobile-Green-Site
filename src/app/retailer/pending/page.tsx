import Link from "next/link";

export default function PendingPage() {
  return (
          <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <div aria-hidden="true" className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl font-black text-amber-700">
          …
        </div>
        <h1 className="mt-7 text-4xl font-black">Application Pending</h1>
        <p className="mt-4 leading-7 text-slate-500">
          Your retailer application has been submitted successfully.
          Our team is reviewing your business information.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6 text-left">
          <div className="flex justify-between"><span>Status</span><strong className="text-amber-600">Pending Review</strong></div>
          <p className="mt-4 text-sm leading-6 text-slate-500">The team will follow up using the email address or phone number you provided after reviewing your application.</p>
        </div>

        <Link href="/" className="mt-7 inline-block font-bold text-orange-600">
          Back to Home →
        </Link>
      </section>
  );
}
