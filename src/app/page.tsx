import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/store";

export default function Home() {
  return (
    <>
      <section className="overflow-hidden bg-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-bold text-orange-300">
              Pakistan&apos;s Mobile Parts Store
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-tight text-white md:text-6xl">
              Quality Mobile Parts.
              <span className="text-orange-500"> Better Business.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Genuine, premium and reliable spare parts for mobile technicians,
              customers and retailers across Pakistan.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop/displays"
                className="rounded-xl bg-orange-500 px-6 py-4 text-center font-black text-white transition hover:bg-orange-600"
              >
                Shop Parts
              </Link>

              <Link
                href="/retailer/register"
                className="rounded-xl border border-white/20 px-6 py-4 text-center font-black text-white transition hover:bg-white/10"
              >
                Become a Retailer
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"
                alt="Mobile phone parts"
                className="h-[420px] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-orange-500">
              Explore
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Shop by Category
            </h2>
          </div>

          <Link
            href="/shop/displays"
            className="hidden font-bold text-orange-600 sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/shop/${category.name
                .toLowerCase()
                .replaceAll(" ", "-")}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:border-orange-300 hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl text-orange-500">
                {category.icon}
              </div>

              <div className="font-bold">
                {category.name}
              </div>

              <div className="mt-1 text-xs text-slate-400">
                {category.count} products
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-widest text-orange-500">
              Popular
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Best Selling Parts
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid overflow-hidden rounded-3xl bg-orange-500 md:grid-cols-2">
          <div className="p-8 md:p-12">
            <div className="text-sm font-black uppercase tracking-widest text-orange-100">
              For Shops
            </div>

            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Buy smarter with wholesale pricing.
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-orange-50">
              Retailers get approved wholesale access, quantity discounts and
              a faster purchasing experience built for busy shops.
            </p>

            <Link
              href="/retailer/register"
              className="mt-7 inline-block rounded-xl bg-white px-6 py-3 font-black text-orange-600"
            >
              Apply for Retailer Access
            </Link>
          </div>

          <div className="hidden bg-orange-600 p-10 md:block">
            <div className="space-y-4">
              {[
                "Wholesale prices",
                "Quantity discounts",
                "Order history",
                "Easy reordering",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/10 p-5 text-lg font-bold text-white"
                >
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3">
          {[
            [
              "01",
              "Quality Assured",
              "Clear product quality and compatibility information.",
            ],
            [
              "02",
              "Pakistan-wide Delivery",
              "Order your required parts from anywhere in Pakistan.",
            ],
            [
              "03",
              "Replacement Support",
              "Clear policies and support when something goes wrong.",
            ],
          ].map(([num, title, text]) => (
            <div
              key={num}
              className="rounded-2xl bg-white p-7 shadow-sm"
            >
              <div className="text-sm font-black text-orange-500">
                {num}
              </div>

              <h3 className="mt-3 text-xl font-black">
                {title}
              </h3>

              <p className="mt-2 leading-7 text-slate-500">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}