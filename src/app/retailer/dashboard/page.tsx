import Link from "next/link";
import { products } from "@/data/store";

export default function RetailerDashboard() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-3xl bg-slate-950 p-8 text-white">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-bold text-green-400">
              Wholesale Access Active
            </div>

            <h1 className="mt-2 text-3xl font-black">
              Welcome, Ahmed Mobile Store
            </h1>

            <p className="mt-2 text-slate-400">
              Your retailer pricing is active.
            </p>
          </div>

          <Link
            href="/shop/displays"
            className="rounded-xl bg-orange-500 px-6 py-3 text-center font-black hover:bg-orange-600"
          >
            Shop Wholesale
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[
          ["Wholesale Savings", "Rs. 18,450"],
          ["Orders", "24"],
          ["Pending Payment", "Rs. 12,500"],
        ].map((item) => (
          <div
            key={item[0]}
            className="rounded-2xl border bg-white p-6"
          >
            <div className="text-sm text-slate-500">
              {item[0]}
            </div>

            <div className="mt-2 text-2xl font-black">
              {item[1]}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-widest text-orange-500">
            Quick Buy
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Retailer Prices
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-44 w-full rounded-xl object-cover"
              />

              <h3 className="mt-4 font-black">
                {product.name}
              </h3>

              <div className="mt-2 text-xs text-slate-400">
                Retail: Rs. {product.price.toLocaleString()}
              </div>

              <div className="mt-1 text-xl font-black text-green-600">
                Retailer: Rs.{" "}
                {Math.round(product.price * 0.82).toLocaleString()}
              </div>

              <Link
                href={`/checkout?type=retailer&product=${product.id}`}
                className="mt-4 block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800"
              >
                Quick Add
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

