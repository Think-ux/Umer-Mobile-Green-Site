import Link from "next/link";

export default function PendingPage() {
  return (
          <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl">
          ?
        </div>
        <h1 className="mt-7 text-4xl font-black">Application Pending</h1>
        <p className="mt-4 leading-7 text-slate-500">
          Your retailer application has been submitted successfully.
          Our team is reviewing your business information.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6 text-left">
          <div className="flex justify-between"><span>Status</span><strong className="text-amber-600">Pending Review</strong></div>
          <div className="mt-4 flex justify-between"><span>Application ID</span><strong>#RET-2048</strong></div>
        </div>

        <Link href="/" className="mt-7 inline-block font-bold text-orange-600">
          Back to Home ?
        </Link>
      </section>
  );
}
