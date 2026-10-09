import Link from "next/link";

export default function RetailerPage() {
  return (
    <>
      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="max-w-3xl">
            <div className="text-sm font-black uppercase tracking-widest text-orange-400">
              Umer Wholesale
            </div>

            <h1 className="mt-4 text-5xl font-black text-white">
              Built for mobile parts retailers.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Get access to wholesale pricing, quantity discounts and faster
              repeat purchasing after approval.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/retailer/register"
                className="rounded-xl bg-orange-500 px-6 py-4 text-center font-black text-white hover:bg-orange-600"
              >
                Apply for Wholesale
              </Link>

              <Link
                href="/retailer/login"
                className="rounded-xl border border-white/20 px-6 py-4 text-center font-black text-white hover:bg-white/10"
              >
                Retailer Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-black">
          How it works
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {[
            ["01", "Register", "Submit your shop and business information."],
            ["02", "Review", "Our team reviews your application."],
            ["03", "Approval", "Approved retailers get wholesale access."],
            ["04", "Buy", "Login and purchase at retailer prices."],
          ].map((item) => (
            <div
              key={item[0]}
              className="rounded-2xl border bg-white p-6"
            >
              <div className="font-black text-orange-500">
                {item[0]}
              </div>

              <h3 className="mt-3 font-black">
                {item[1]}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item[2]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
