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
  stock: number;
  rating: number;
  image: string;
};

export const products: Product[] = [
  {
    id: 1,
    slug: "iphone-13-lcd-premium",
    name: "iPhone 13 LCD Premium",
    brand: "Apple",
    model: "iPhone 13",
    category: "Displays",
    quality: "Premium",
    price: 12500,
    oldPrice: 14000,
    stock: 12,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1592286927505-2fd7b8e6b9a0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    slug: "samsung-a15-lcd",
    name: "Samsung A15 LCD",
    brand: "Samsung",
    model: "A15",
    category: "Displays",
    quality: "Original",
    price: 7200,
    oldPrice: 8000,
    stock: 18,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    slug: "iphone-11-battery",
    name: "iPhone 11 Battery",
    brand: "Apple",
    model: "iPhone 11",
    category: "Batteries",
    quality: "Premium",
    price: 4200,
    oldPrice: 4800,
    stock: 25,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1609592424274-7f7f8f6e8b35?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    slug: "samsung-s23-charging-flex",
    name: "Samsung S23 Charging Flex",
    brand: "Samsung",
    model: "S23",
    category: "Charging Parts",
    quality: "Premium",
    price: 2800,
    oldPrice: 3200,
    stock: 31,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    slug: "iphone-12-camera-glass",
    name: "iPhone 12 Camera Glass",
    brand: "Apple",
    model: "iPhone 12",
    category: "Camera Parts",
    quality: "Original",
    price: 1600,
    oldPrice: 1900,
    stock: 40,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    slug: "redmi-note-12-housing",
    name: "Redmi Note 12 Housing",
    brand: "Xiaomi",
    model: "Note 12",
    category: "Housing",
    quality: "Premium",
    price: 2300,
    oldPrice: 2600,
    stock: 15,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
  },
];

export const categories = [
  { name: "Displays", icon: "▣", count: 124 },
  { name: "Batteries", icon: "▰", count: 86 },
  { name: "Charging Parts", icon: "⚡", count: 72 },
  { name: "Camera Parts", icon: "◉", count: 54 },
  { name: "Housing", icon: "▱", count: 61 },
  { name: "Flex", icon: "≋", count: 48 },
];
