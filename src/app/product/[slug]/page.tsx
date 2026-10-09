import { notFound } from "next/navigation";
import { products } from "@/data/store";
import ProductDetailClient from "@/components/ProductDetailClient";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = products.find(
    (item) => item.slug === slug
  );

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient product={product} />
  );
}