"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  categories as initialCategories,
  products as initialProducts,
  type Product,
} from "@/data/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type StoreCategory = {
  name: string;
  icon: string;
  icon_image_url?: string;
  count: number;
};

export type StoreBrand = {
  id: number;
  name: string;
  sort_order: number;
};

export type StoreReview = {
  id: number;
  product_id: number;
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
  product_name: string;
};

export type StoreBanner = {
  id: number;
  title: string;
  image_url: string;
  placement: string;
  link_url: string;
};

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  phone: string;
  whatsapp: string;
  contactVerified: boolean;
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  deliveryCharge: number | null;
  freeDeliveryThreshold: number | null;
  estimatedDelivery: string;
  deliveryVerified: boolean;
};

type CatalogStatus = "loading" | "ready" | "unconfigured" | "error";

type CatalogContextValue = {
  products: Product[];
  categories: StoreCategory[];
  brands: StoreBrand[];
  reviews: StoreReview[];
  homepage: HomepageContent;
  banners: StoreBanner[];
  settings: StoreSettings;
  status: CatalogStatus;
  error: string;
  refresh: () => Promise<void>;
};

export type HomepageContent = {
  eyebrow: string;
  headline: string;
  description: string;
  button_label: string;
  button_href: string;
  hero_highlights: string[];
  category_heading: string;
  category_description: string;
  show_categories: boolean;
  brand_heading: string;
  brand_description: string;
  show_brands: boolean;
  featured_heading: string;
  show_featured: boolean;
  products_heading: string;
  show_products: boolean;
  show_reviews: boolean;
  reviews_heading: string;
  show_retailer_cta: boolean;
  retailer_heading: string;
  retailer_description: string;
  retailer_button_label: string;
};

const initialHomepage: HomepageContent = {
  eyebrow: "UMER MOBILE PARTS",
  headline: "Find Quality Mobile Spare Parts",
  description:
    "Displays, batteries, charging parts and other mobile spare parts — explore our catalog to find the part that matches your device.",
  button_label: "Shop Parts",
  button_href: "/search",
  hero_highlights: [
    "Easy product discovery",
    "Model-focused browsing",
    "Customer support",
  ],
  category_heading: "Shop by Category",
  category_description:
    "Find the spare part you need with a simpler category-based shopping experience.",
  show_categories: true,
  brand_heading: "Shop by Mobile Brand",
  brand_description:
    "Availability and model compatibility should be confirmed against the actual product listing.",
  show_brands: true,
  featured_heading: "Featured Products",
  show_featured: true,
  products_heading: "More Products",
  show_products: true,
  show_reviews: true,
  reviews_heading: "What Customers Say",
  show_retailer_cta: true,
  retailer_heading: "Looking for wholesale?",
  retailer_description: "For retailers and repair shops",
  retailer_button_label: "Explore retailer options",
};

const initialSettings: StoreSettings = {
  storeName: "Umer Mobile Parts",
  supportEmail: "",
  phone: "",
  whatsapp: "",
  contactVerified: false,
  social: { instagram: "", facebook: "", tiktok: "" },
  deliveryCharge: null,
  freeDeliveryThreshold: null,
  estimatedDelivery: "",
  deliveryVerified: false,
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] =
    useState<StoreCategory[]>(initialCategories);
  const [brands, setBrands] = useState<StoreBrand[]>([]);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [homepage, setHomepage] = useState(initialHomepage);
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState<CatalogStatus>("loading");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setProducts(initialProducts);
      setCategories(initialCategories);
      setBrands([]);
      setReviews([]);
      setHomepage(initialHomepage);
      setBanners([]);
      setSettings(initialSettings);
      setStatus("unconfigured");
      setError("");
      return;
    }

    setStatus("loading");
    setError("");

    const [productResult, categoryResult, brandResult, reviewResult, contentResult, bannerResult, settingsResult] = await Promise.all([
      supabase
        .from("products")
        .select("id,slug,name,brand,model,category,quality,price,old_price,stock,rating,image,is_featured")
        .eq("is_published", true)
        .order("name")
        .returns<(Omit<Product, "oldPrice"> & { old_price: number })[]>(),
      supabase
        .from("categories")
        .select("name,icon,count,sort_order")
        .eq("is_enabled", true)
        .order("sort_order")
        .returns<StoreCategory[]>(),
      supabase
        .from("brands")
        .select("id,name,sort_order")
        .eq("is_enabled", true)
        .order("sort_order")
        .returns<StoreBrand[]>(),
      supabase
        .from("reviews")
        .select("id,product_id,reviewer_name,rating,review_text,created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("site_content")
        .select("content")
        .eq("content_key", "homepage")
        .maybeSingle(),
      supabase
        .from("banners")
        .select("id,title,image_url,placement,link_url")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .returns<StoreBanner[]>(),
      supabase
        .from("site_settings")
        .select("setting_key,setting_value")
        .returns<{ setting_key: string; setting_value: Record<string, unknown> }[]>(),
    ]);

    if (
      productResult.error ||
      categoryResult.error ||
      brandResult.error ||
      reviewResult.error ||
      contentResult.error ||
      bannerResult.error ||
      settingsResult.error
    ) {
      const message = [
        productResult.error?.message,
        categoryResult.error?.message,
        brandResult.error?.message,
        reviewResult.error?.message,
        contentResult.error?.message,
        bannerResult.error?.message,
        settingsResult.error?.message,
      ]
        .filter(Boolean)
        .join(" ");
      setProducts(initialProducts);
      setCategories(initialCategories);
      setBrands([]);
      setReviews([]);
      setHomepage(initialHomepage);
      setBanners([]);
      setSettings(initialSettings);
      setError(message);
      setStatus("error");
      return;
    }

    const publishedProducts = productResult.data.map(({ old_price, ...product }) => ({
      ...product,
      oldPrice: old_price,
    }));
    const { data: categoryImageData, error: categoryImageError } = await supabase
      .from("categories")
      .select("name,icon_image_url")
      .eq("is_enabled", true);
    const iconColumnUnavailable =
      categoryImageError?.message.includes("icon_image_url") === true &&
      (categoryImageError.message.includes("schema cache") ||
        categoryImageError.message.includes("does not exist"));
    if (categoryImageError && !iconColumnUnavailable) {
      setError(`Could not load category icons: ${categoryImageError.message}`);
      setStatus("error");
      return;
    }
    const categoryImages = new Map(
      (categoryImageData ?? []).map((category) => [
        category.name,
        category.icon_image_url,
      ])
    );
    const enabledCategories = categoryResult.data.map((category) => ({
      ...category,
      icon_image_url: categoryImages.get(category.name) ?? "",
      count: publishedProducts.filter(
        (product) => product.category === category.name
      ).length,
    }));
    const enabledCategoryNames = new Set(
      enabledCategories.map((category) => category.name)
    );
    setProducts(
      publishedProducts.filter((product) =>
        enabledCategoryNames.has(product.category)
      )
    );
    setCategories(enabledCategories);
    setBrands(brandResult.data);
    setReviews(
      reviewResult.data.map((review) => ({
        ...review,
        product_name:
          publishedProducts.find((product) => product.id === review.product_id)?.name ??
          "Mobile part",
      }))
    );
    const savedHomepage = contentResult.data?.content;
    setHomepage(
      savedHomepage && typeof savedHomepage === "object"
        ? {
            ...initialHomepage,
            ...savedHomepage,
            hero_highlights:
              "hero_highlights" in savedHomepage &&
              Array.isArray(savedHomepage.hero_highlights)
                ? savedHomepage.hero_highlights.filter(
                    (highlight: unknown): highlight is string =>
                      typeof highlight === "string"
                  )
                : initialHomepage.hero_highlights,
          }
        : initialHomepage
    );
    setBanners(bannerResult.data);
    const settingsByKey = Object.fromEntries(
      settingsResult.data.map(({ setting_key, setting_value }) => [
        setting_key,
        setting_value,
      ])
    );
    const storeSettings = settingsByKey.store ?? {};
    const deliverySettings = settingsByKey.delivery ?? {};
    const socialSettings = settingsByKey.social ?? {};
    const hasAllContactDetails =
      typeof storeSettings.phone === "string" &&
      storeSettings.phone.trim() !== "" &&
      typeof storeSettings.whatsapp === "string" &&
      storeSettings.whatsapp.trim() !== "" &&
      typeof storeSettings.support_email === "string" &&
      storeSettings.support_email.trim() !== "";
    const contactVerified =
      storeSettings.contact_verified === true && hasAllContactDetails;
    const deliveryVerified = deliverySettings.details_verified === true;
    const safeNumber = (value: unknown, fallback: number | null) => {
      if (value === null || value === undefined || value === "") {
        return fallback;
      }
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    };
    setSettings({
      storeName:
        typeof storeSettings.name === "string"
          ? storeSettings.name
          : initialSettings.storeName,
      supportEmail:
        contactVerified && typeof storeSettings.support_email === "string"
          ? storeSettings.support_email
          : "",
      phone:
        contactVerified && typeof storeSettings.phone === "string"
          ? storeSettings.phone
          : "",
      whatsapp:
        contactVerified && typeof storeSettings.whatsapp === "string"
          ? storeSettings.whatsapp
          : "",
      contactVerified,
      social: {
        instagram:
          typeof socialSettings.instagram === "string"
            ? socialSettings.instagram
            : "",
        facebook:
          typeof socialSettings.facebook === "string"
            ? socialSettings.facebook
            : "",
        tiktok:
          typeof socialSettings.tiktok === "string"
            ? socialSettings.tiktok
            : "",
      },
      deliveryCharge: deliveryVerified ? safeNumber(
        deliverySettings.charge,
        null
      ) : null,
      freeDeliveryThreshold: deliveryVerified ? safeNumber(
        deliverySettings.free_threshold,
        null
      ) : null,
      estimatedDelivery:
        deliveryVerified && typeof deliverySettings.estimated_time === "string"
          ? deliverySettings.estimated_time
          : "",
      deliveryVerified,
    });
    setStatus("ready");
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const value = useMemo(
    () => ({ products, categories, brands, reviews, homepage, banners, settings, status, error, refresh }),
    [products, categories, brands, reviews, homepage, banners, settings, status, error, refresh]
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider.");
  }

  return context;
}
