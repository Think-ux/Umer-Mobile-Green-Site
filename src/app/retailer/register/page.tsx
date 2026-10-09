import Link from "next/link";

export default function RetailerRegister() {
  return (
          <section className="mx-auto max-w-2xl px-4 py-14">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-orange-500">Retailer Application</p>
          <h1 className="mt-2 text-4xl font-black">Become a Umer retailer</h1>
          <p className="mt-3 text-slate-500">Tell us about your business. Approval unlocks wholesale pricing.</p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-5">
            <input className="rounded-xl border p-4" placeholder="Owner full name" />
            <input className="rounded-xl border p-4" placeholder="Shop / business name" />
            <input className="rounded-xl border p-4" placeholder="Phone number" />
            <input className="rounded-xl border p-4" placeholder="Shop address" />
            <input className="rounded-xl border p-4" placeholder="City" />
            <textarea className="min-h-32 rounded-xl border p-4" placeholder="Tell us briefly about your business" />
            <button className="rounded-xl bg-orange-500 px-5 py-4 font-black text-white">
              Submit Application
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already approved? <Link href="/retailer/login" className="font-bold text-orange-600">Login here</Link>
        </p>
      </section>
  );
}
