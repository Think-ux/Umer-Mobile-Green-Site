import Link from "next/link";
import { products, categories } from "@/data/store";
import ProductCard from "@/components/ProductCard";

type Props = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return categories.map((item) => ({
    category: item.name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/\s+/g, "-"),
  }));
}
export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;

  const categoryName = decodeURIComponent(category)
    .replace(/-/g, " ")
    .replace(/\band\b/gi, "&")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const matchedCategory = categories.find(
    (item) =>
      item.name.toLowerCase() === categoryName.toLowerCase()
  );

  if (!matchedCategory) {
    return (
      <main className="min-h-[60vh] bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <div className="text-5xl" aria-hidden="true">⌕</div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">
            Category Not Found
          </h1>
          <p className="mt-3 text-slate-500">
            This category is not available.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const filteredProducts = products.filter(
    (product) =>
      product.category.toLowerCase() ===
      matchedCategory.name.toLowerCase()
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-orange-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/search" className="hover:text-orange-600">
              Shop
            </Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-slate-900">
              {matchedCategory.name}
            </span>
          </nav>

          <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                Umer Mobile Parts
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {matchedCategory.name}
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Find mobile spare parts by category and check the
                compatible model before ordering.
              </p>
            </div>

            <div className="w-fit rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-bold shadow-sm">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "Product" : "Products"}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Browse {matchedCategory.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review product details, compatibility and prices.
            </p>
          </div>

          <Link
            href="/search"
            className="text-sm font-bold text-orange-600 hover:text-orange-700"
          >
            Search products →
          </Link>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="text-4xl" aria-hidden="true">◇</div>
            <h2 className="mt-5 text-2xl font-black">
              Products Coming Soon
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              No products are currently listed in this category.
            </p>
            <Link
              href="/search"
              className="mt-6 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
            >
              Explore Products
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

