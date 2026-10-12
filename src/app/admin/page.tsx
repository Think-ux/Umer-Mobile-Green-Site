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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 rounded-3xl bg-slate-950 p-6 text-white sm:p-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Store control centre
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Manage your storefront
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              A single workspace for daily catalog, website content and order
              operations.
            </p>
          </div>
          <span className={`w-fit rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
            status === "ready"
              ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
              : "border-amber-300/30 bg-amber-300/10 text-amber-200"
          }`}>
            {connectionLabel}
          </span>
        </div>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-black">Website management</h2>
            <p className="mt-1 text-sm text-slate-500">
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
          <div className="mb-4">
            <h2 className="text-xl font-black">Store operations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep daily product, category and customer workflows together.
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

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Published products", products.length],
            ["Visible categories", categories.length],
            ["Published homepage banners", banners.length],
          ].map(([label, value]) => (
            <section key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
              Live catalog
            </p>
            <h2 className="mt-2 text-2xl font-black">{value}</h2>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
            </section>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          Customer orders and registered accounts are shared through Supabase and can be managed from this CMS. Retailer applications and product reviews are managed here as well.
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
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl font-black text-orange-600">
          {icon}
        </span>
        <span className="text-sm font-black text-slate-400 transition group-hover:text-orange-500">
          Open →
        </span>
      </div>
      <h3 className="mt-5 font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}
