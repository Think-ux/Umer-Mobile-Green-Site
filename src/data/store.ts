export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  quality: string;
  price: number;
  oldPrice: number;
  retailerDiscountPercent: number;
  stock: number;
  rating: number;
  image: string;
  is_featured?: boolean;
};

export const categories = [
  { name: "Displays", icon: "▣", icon_image_url: "", count: 2 },
  { name: "Batteries", icon: "▰", icon_image_url: "", count: 1 },
  { name: "Charging Parts", icon: "⚡", icon_image_url: "", count: 1 },
  { name: "Camera Parts", icon: "◉", icon_image_url: "", count: 1 },
  { name: "Housing", icon: "▱", icon_image_url: "", count: 1 },
  { name: "Flex", icon: "≋", icon_image_url: "", count: 0 },
];

export function categorySlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
