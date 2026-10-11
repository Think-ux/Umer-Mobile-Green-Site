import { categories, categorySlug } from "@/data/store";
import ShopCategoryClient from "@/components/ShopCategoryClient";

type Props = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return categories.map((item) => ({
    category: categorySlug(item.name),
  }));
}

export default async function ShopCategoryPage({ params }: Props) {
  const { category } = await params;
  return <ShopCategoryClient category={category} />;
}
