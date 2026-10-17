"use client";

import Link from "next/link";
import { useCatalog } from "@/components/CatalogProvider";

const modules = [
  {
    group: "Website",
    title: "Homepage content",
    description: "Edit hero messaging, featured sections and storefront copy.",
    href: "/admin/content",
    icon: "✎",
  },
  {
    group: "Website",
    title: "Banners",
    description: "Prepare promotional artwork, links and campaign placements.",
    href: "/admin/banners",
    icon: "▧",
  },
  {
    group: "Website",
    title: "Site settings",
    description: "Keep contact, delivery and social details in one place.",
    href: "/admin/settings",
    icon: "⚙",
  },
  {
    group: "Store",
    title: "Products",
    description: "Maintain product descriptions, pricing, stock and images.",
    href: "/admin/products",
    icon: "□",
  },
  {
    group: "Store",
    title: "Categories",
    description: "Organize the catalog and keep category pages current.",
    href: "/admin/categories",
    icon: "▦",
  },
  {
    group: "Store",
    title: "Orders",
    description: "Review shared customer orders and update their live tracking status.",
    href: "/admin/orders",
    icon: "▤",
  },
  {
    group: "Store",
    title: "Retailers & reviews",
    description: "Review retailer applications and moderate customer product reviews.",
    href: "/admin/retailers",
    icon: "◇",
  },
];

export default function AdminPage() {
  const { products, categories, banners, status } = useCatalog();

  const connectionLabel =
    status === "ready"
      ? "Supabase connected"
      : status === "unconfigured"
        ? "Supabase setup required"
        : status === "error"
          ? "Catalog sync needs attention"
          : "Connecting to Supabase…";

  const quickStats = [
    { label: "Published products", value: products.length, tone: "lime" },
    { label: "Visible categories", value: categories.length, tone: "slate" },
    { label: "Published banners", value: banners.length, tone: "amber" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/15">
          <div className="flex flex-col gap-6 bg-[radial-gradient(circle_at_top_right,_rgba(198,255,0,0.18),transparent_28%),linear-gradient(135deg,#0b0d0b_0%,#111712_35%,#0b0d0b_100%)] p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
                Store control centre
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Manage your storefront
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Keep product, retailer, and content work in one place while your
                storefront stays consistent and customer-ready.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${
                  status === "ready"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-amber-300/30 bg-amber-300/10 text-amber-200"
                }`}
              >
                {connectionLabel}
              </span>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
              >
                View storefront →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {quickStats.map(({ label, value, tone }) => (
            <section
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                Live catalog
              </p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-3xl font-black text-slate-900">{value}</span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                    tone === "lime"
                      ? "bg-lime-100 text-lime-700"
                      : tone === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tone}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{label}</p>
            </section>
          ))}
        </div>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-lime-700">
                Website management
              </p>
              <h2 className="mt-1 text-xl font-black">Storefront updates</h2>
            </div>
            <p className="text-sm text-slate-500">
              Update the content customers see across the storefront.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {modules
              .filter((module) => module.group === "Website")
              .map((module) => (
                <ModuleCard key={module.href} {...module} />
              ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-lime-700">
                Store operations
              </p>
              <h2 className="mt-1 text-xl font-black">Daily workflows</h2>
            </div>
            <p className="text-sm text-slate-500">
              Keep product, category, and customer workflows aligned.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {modules
              .filter((module) => module.group === "Store")
              .map((module) => (
                <ModuleCard key={module.href} {...module} />
              ))}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900 shadow-sm">
          Customer orders and registered accounts are shared through Supabase and
          can be managed from this CMS. Retailer applications and customer
          product reviews are managed here as well.
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  title,
  description,
  href,
  icon,
}: (typeof modules)[number]) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-lime-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-50 text-xl font-black text-lime-700">
          {icon}
        </span>
        <span className="text-sm font-black text-slate-400 transition group-hover:text-lime-700">
          Open →
        </span>
      </div>
      <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}
