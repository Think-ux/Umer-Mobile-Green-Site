import Link from "next/link";

export default function RetailerLogin() {
  return (
          <section className="mx-auto max-w-md px-4 py-20">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 font-black text-white">U</div>
          <h1 className="mt-5 text-3xl font-black">Retailer Login</h1>
          <p className="mt-2 text-slate-500">Access your wholesale account.</p>
        </div>

        <div className="rounded-3xl border bg-white p-7 shadow-sm">
          <div className="space-y-4">
            <input className="w-full rounded-xl border p-4" placeholder="Phone or email" />
            <input className="w-full rounded-xl border p-4" type="password" placeholder="Password" />
            <Link href="/retailer/dashboard" className="block rounded-xl bg-slate-950 px-5 py-4 text-center font-black text-white">
              Login
            </Link>
          </div>
        </div>
      </section>
  );
}
