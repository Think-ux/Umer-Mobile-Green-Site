"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCatalog } from "@/components/CatalogProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type HomepageContent = {
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

const initialContent: HomepageContent = {
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

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500";

export default function AdminContentPage() {
  const { refresh } = useCatalog();
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadContent() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase is not configured. Homepage changes cannot be loaded.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("site_content")
        .select("content")
        .eq("content_key", "homepage")
        .maybeSingle();

      if (!active) return;
      if (queryError) {
        setError(`Could not load homepage content: ${queryError.message}`);
      } else if (data?.content && typeof data.content === "object") {
        setContent({
          ...initialContent,
          ...data.content,
          hero_highlights:
            "hero_highlights" in data.content &&
            Array.isArray(data.content.hero_highlights)
              ? data.content.hero_highlights.filter(
                  (highlight: unknown): highlight is string =>
                    typeof highlight === "string"
                )
              : initialContent.hero_highlights,
        });
      }
      setLoading(false);
    }

    void loadContent();
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof HomepageContent>(
    key: K,
    value: HomepageContent[K]
  ) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateHighlight(index: number, value: string) {
    setContent((current) => ({
      ...current,
      hero_highlights: current.hero_highlights.map((highlight, currentIndex) =>
        currentIndex === index ? value : highlight
      ),
    }));
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    if (!content.button_href.startsWith("/") || content.button_href.startsWith("//")) {
      setError("Button destination must be a local site path beginning with one slash.");
      setBusy(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Homepage changes have not been saved.");
      setBusy(false);
      return;
    }

    const { error: saveError } = await supabase
      .from("site_content")
      .upsert(
        { content_key: "homepage", content, updated_at: new Date().toISOString() },
        { onConflict: "content_key" }
      );

    if (saveError) {
      setError(`Homepage content was not saved: ${saveError.message}`);
    } else {
      await refresh();
      setNotice("Homepage content saved to the shared database.");
    }
    setBusy(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <PageHeading
          eyebrow="Website management"
          title="Homepage content"
          description="Manage the key messages and sections customers see on your storefront."
        />

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}

        <form onSubmit={saveContent} className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <SectionHeading number="01" title="Hero section" />
              <div className="mt-5 grid gap-4">
                <label className="text-sm font-bold text-slate-700">
                  Eyebrow text
                  <input className={fieldClass} value={content.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Main headline
                  <textarea
                    className={fieldClass}
                    rows={2}
                    value={content.headline}
                    onChange={(event) => update("headline", event.target.value)}
                  />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Supporting text
                  <textarea
                    className={fieldClass}
                    rows={3}
                    value={content.description}
                    onChange={(event) => update("description", event.target.value)}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">
                    Button label
                    <input className={fieldClass} value={content.button_label} onChange={(event) => update("button_label", event.target.value)} />
                  </label>
                  <label className="text-sm font-bold text-slate-700">
                    Button destination
                    <input className={fieldClass} value={content.button_href} onChange={(event) => update("button_href", event.target.value)} />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {content.hero_highlights.map((highlight, index) => (
                    <label key={index} className="text-sm font-bold text-slate-700">
                      Hero highlight {index + 1}
                      <input
                        maxLength={60}
                        className={fieldClass}
                        value={highlight}
                        onChange={(event) => updateHighlight(index, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <SectionHeading number="02" title="Storefront sections" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={content.show_categories} onChange={(event) => update("show_categories", event.target.checked)} className="h-4 w-4 accent-orange-500" />
                  Show category section
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Section heading
                  <input className={fieldClass} value={content.category_heading} onChange={(event) => update("category_heading", event.target.value)} />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Section description
                  <input className={fieldClass} value={content.category_description} onChange={(event) => update("category_description", event.target.value)} />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={content.show_brands} onChange={(event) => update("show_brands", event.target.checked)} className="h-4 w-4 accent-orange-500" />
                  Show brand section
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Brand section heading
                  <input className={fieldClass} value={content.brand_heading} onChange={(event) => update("brand_heading", event.target.value)} />
                </label>
                <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                  Brand section description
                  <input className={fieldClass} value={content.brand_description} onChange={(event) => update("brand_description", event.target.value)} />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={content.show_featured} onChange={(event) => update("show_featured", event.target.checked)} className="h-4 w-4 accent-orange-500" />
                  Show featured products
                </label>
                <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                  Featured products heading
                  <input className={fieldClass} value={content.featured_heading} onChange={(event) => update("featured_heading", event.target.value)} />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={content.show_products} onChange={(event) => update("show_products", event.target.checked)} className="h-4 w-4 accent-orange-500" />
                  Show all products section
                </label>
                <label className="text-sm font-bold text-slate-700">
                  All products heading
                  <input className={fieldClass} value={content.products_heading} onChange={(event) => update("products_heading", event.target.value)} />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={content.show_reviews} onChange={(event) => update("show_reviews", event.target.checked)} className="h-4 w-4 accent-orange-500" />
                  Show approved customer reviews
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Reviews heading
                  <input className={fieldClass} value={content.reviews_heading} onChange={(event) => update("reviews_heading", event.target.value)} />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 sm:col-span-2">
                  <input type="checkbox" checked={content.show_retailer_cta} onChange={(event) => update("show_retailer_cta", event.target.checked)} className="h-4 w-4 accent-orange-500" />
                  Show retailer enquiry card
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Retailer card description
                  <input className={fieldClass} value={content.retailer_description} onChange={(event) => update("retailer_description", event.target.value)} />
                </label>
                <label className="text-sm font-bold text-slate-700">
                  Retailer card heading
                  <input className={fieldClass} value={content.retailer_heading} onChange={(event) => update("retailer_heading", event.target.value)} />
                </label>
                <label className="text-sm font-bold text-slate-700 sm:col-span-2">
                  Retailer link label
                  <input className={fieldClass} value={content.retailer_button_label} onChange={(event) => update("retailer_button_label", event.target.value)} />
                </label>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <SectionHeading number="Preview" title="Content checklist" />
            <ul className="mt-5 space-y-3">
              {[
                ["Hero headline", "Visible above the fold"],
                ["Primary call to action", "Links to the product discovery page"],
                ["Category section", content.show_categories ? "Visible on storefront" : "Hidden on storefront"],
                ["Brand section", content.show_brands ? "Visible on storefront" : "Hidden on storefront"],
                ["Featured products", content.show_featured ? "Visible on storefront" : "Hidden on storefront"],
                ["All products", content.show_products ? "Visible on storefront" : "Hidden on storefront"],
                ["Customer reviews", content.show_reviews ? "Visible when approved reviews exist" : "Hidden on storefront"],
                ["Retailer enquiry card", content.show_retailer_cta ? "Visible on storefront" : "Hidden on storefront"],
              ].map(([title, detail]) => (
                <li key={title} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="mt-0.5 text-emerald-600" aria-hidden="true">✓</span>
                  <span>
                    <span className="block text-sm font-black">{title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              disabled={loading || busy}
              className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Loading…" : busy ? "Saving…" : "Save and publish"}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-orange-50 px-2 text-xs font-black text-orange-600">
        {number}
      </span>
      <h2 className="text-lg font-black">{title}</h2>
    </div>
  );
}
