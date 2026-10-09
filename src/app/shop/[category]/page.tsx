import { products, categories } from "@/data/store";
import ProductCard from "@/components/ProductCard";

export const instant = false;

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;

  const categoryName = category
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const categoryExists = categories.some(
    (item) => item.name.toLowerCase() === categoryName.toLowerCase()
  );

  const filteredProducts = products.filter(
    (product) =>
      product.category.toLowerCase() === categoryName.toLowerCase()
  );

  if (!categoryExists) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-black">Category Not Found</h1>
          <p className="mt-2 text-slate-500">
            The requested category does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-orange-500">
            Mobile Parts
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-950">
            {categoryName}
          </h1>

          <p className="mt-2 text-slate-500">
            {filteredProducts.length} products available
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h2 className="text-xl font-black">
              No products found
            </h2>
            <p className="mt-2 text-slate-500">
              There are currently no products in this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}