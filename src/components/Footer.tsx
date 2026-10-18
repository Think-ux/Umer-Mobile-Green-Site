"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCatalog } from "@/components/CatalogProvider";
import { categorySlug } from "@/data/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button, Input } from "@/components/ui";

const linkClass = "text-sm text-slate-400 transition hover:text-brand-primary";

export default function Footer() {
  const { categories, brands, settings } = useCatalog();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterNotice, setNewsletterNotice] = useState("");
  const whatsapp = settings.whatsapp.replace(/\D/g, "");
  const featuredCategories = categories
    .filter((category) => category.parentId === null)
    .slice(0, 4);
  const featuredBrands = brands.slice(0, 4);
  const socialLinks = [
    ["Instagram", settings.social.instagram],
    ["Facebook", settings.social.facebook],
    ["TikTok", settings.social.tiktok],
  ].filter(([, value]) => isHttpsUrl(value));

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterBusy(true);
    setNewsletterError("");
    setNewsletterNotice("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNewsletterError("Newsletter signup is unavailable because Supabase is not configured.");
      setNewsletterBusy(false);
      return;
    }
    const { error } = await supabase.rpc("subscribe_newsletter", {
      p_email: newsletterEmail.trim(),
    });
    if (error) {
      setNewsletterError(`Could not subscribe: ${error.message}`);
      setNewsletterBusy(false);
      return;
    }
    setNewsletterEmail("");
    setNewsletterNotice("Thanks for subscribing. You can unsubscribe by contacting the store.");
    setNewsletterBusy(false);
  }

  return (
    <footer className="border-t border-market-800 bg-market-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-9 px-4 py-10 sm:grid-cols-2 lg:grid-cols-6 lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/umer-mobile-parts-logo.svg" alt={settings.storeName} className="h-14 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
            Find mobile spare parts by category, brand and device model.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-wider">Browse</h2>
          <nav aria-label="Browse links" className="mt-4 flex flex-col items-start gap-3">
            <Link className={linkClass} href="/search">All products</Link>
            {featuredCategories.map((category) => (
              <Link
                className={linkClass}
                href={`/shop/${categorySlug(category.name)}`}
                key={category.name}
              >
                {category.name}
              </Link>
            ))}
            <Link className="text-sm font-bold text-brand-primary hover:text-lime-300" href="/#categories">
              All categories →
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-wider">Brands</h2>
          <nav aria-label="Brand links" className="mt-4 flex flex-col items-start gap-3">
            {featuredBrands.map((brand) => (
              <Link
                className={linkClass}
                href={`/search?q=${encodeURIComponent(brand.name)}`}
                key={brand.id}
              >
                {brand.name}
              </Link>
            ))}
            {featuredBrands.length === 0 && (
              <p className="text-sm text-slate-400">Brands will appear here as they are added.</p>
            )}
            <Link className="text-sm font-bold text-brand-primary hover:text-lime-300" href="/#brands">
              All brands →
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-wider">Help</h2>
          <nav aria-label="Help and policy links" className="mt-4 flex flex-col items-start gap-3">
            <Link className={linkClass} href="/customer-care">Contact &amp; FAQs</Link>
            <Link className={linkClass} href="/track-order">Track order</Link>
            <Link className={linkClass} href="/shipping-policy">Shipping</Link>
            <Link className={linkClass} href="/returns-policy">Returns</Link>
            <Link className={linkClass} href="/privacy-policy">Privacy</Link>
            <Link className={linkClass} href="/terms">Terms</Link>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-wider">Newsletter</h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Get store updates and new-part announcements by email.
          </p>
          <form onSubmit={subscribe} className="mt-4 space-y-3">
            <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
            <Input
              id="footer-newsletter-email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="you@example.com"
              className="border-market-700 bg-market-900 px-3 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-primary"
            />
            <label className="flex items-start gap-2 text-xs leading-5 text-slate-400">
              <input type="checkbox" required className="mt-1 accent-lime-400" />
              <span>I agree to receive email updates from Umer Mobile Parts.</span>
            </label>
            <Button
              type="submit"
              disabled={newsletterBusy}
              className="w-full px-4 disabled:opacity-60"
            >
              {newsletterBusy ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
          {newsletterError && <p role="alert" className="mt-3 text-xs text-red-300">{newsletterError}</p>}
          {newsletterNotice && <p role="status" className="mt-3 text-xs text-emerald-300">{newsletterNotice}</p>}
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-wider">Contact</h2>
          <div className="mt-4 flex flex-col items-start gap-4">
            {settings.phone && (
              <a className={linkClass} href={`tel:${settings.phone}`}>
                Call: {settings.phone}
              </a>
            )}
            {settings.whatsapp && (
              <a
                className={linkClass}
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp: {settings.whatsapp}
              </a>
            )}
            {settings.supportEmail && (
              <a className={linkClass} href={`mailto:${settings.supportEmail}`}>
                {settings.supportEmail}
              </a>
            )}
            {!settings.phone &&
              !settings.whatsapp &&
              !settings.supportEmail &&
              (
              <p className="max-w-xs text-sm leading-6 text-slate-400">
                Contact details are being confirmed. Check the FAQs for current information.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-market-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>{"\u00A9"} 2026 {settings.storeName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
            <Link className="hover:text-slate-300" href="/retailer">Retailer enquiries</Link>
            {socialLinks.map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-400 transition hover:text-brand-primary"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
