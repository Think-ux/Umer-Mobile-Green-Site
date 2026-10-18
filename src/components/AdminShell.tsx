"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCatalog } from "@/components/CatalogProvider";

const navigation = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin" }],
  },
  {
    label: "Website",
    items: [
      { label: "Homepage content", href: "/admin/content" },
      { label: "Banners", href: "/admin/banners" },
      { label: "Site settings", href: "/admin/settings" },
    ],
  },
  {
    label: "Store",
    items: [
      { label: "Products", href: "/admin/products" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Brands", href: "/admin/brands" },
      { label: "Orders", href: "/admin/orders" },
      { label: "Customer accounts", href: "/admin/accounts" },
      { label: "Retailers", href: "/admin/retailers" },
      { label: "Reviews", href: "/admin/reviews" },
    ],
  },
];

function NavigationLinks({
  mobile = false,
  role,
}: {
  mobile?: boolean;
  role: string | null;
}) {
  const pathname = usePathname();
    const visibleGroups = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (role !== "admin" && item.href === "/admin/accounts") {
          return false;
        }

        if (
          role !== "admin" &&
          ["/admin/content", "/admin/banners", "/admin/settings"].includes(item.href)
        ) {
          return false;
        }

        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav
      aria-label="CMS navigation"
      className={mobile ? "flex min-w-max gap-5 px-4 pb-3" : "space-y-6"}
    >
      {visibleGroups.map((group) => (
        <div key={group.label} className={mobile ? "shrink-0" : undefined}>
          <p
            className={`mb-2 px-3 text-3xs font-black uppercase tracking-eyebrow-wide ${
              mobile ? "text-lime-300" : "text-slate-500"
            }`}
          >
            {group.label}
          </p>
          <div className={mobile ? "flex gap-2" : "space-y-1.5"}>
            {group.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-lime-300 text-slate-950 shadow-sm shadow-lime-900/10"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  } ${mobile ? "whitespace-nowrap border border-white/10" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useCatalog();
  const isLoginPage = pathname === "/admin/login";
  const [authState, setAuthState] = useState<
    "checking" | "ready" | "signed-out" | "not-admin" | "unconfigured"
  >("checking");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSignOutError("Supabase is not configured. Could not sign out.");
      return;
    }
    setSigningOut(true);
    setSignOutError("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSignOutError(`Could not sign out: ${error.message}`);
      setSigningOut(false);
      return;
    }
    router.replace("/admin/login");
  }

  useEffect(() => {
    if (isLoginPage) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.session) {
        setUserRole(null);
        setAuthState("signed-out");
        router.replace("/admin/login");
        return;
      }
      setUserRole(String(data.session.user.app_metadata.role ?? ""));
      setAuthState(
        ["admin", "store_manager"].includes(String(data.session.user.app_metadata.role))
          ? "ready"
          : "not-admin"
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        setUserRole(null);
        setAuthState("signed-out");
        router.replace("/admin/login");
      } else {
        setUserRole(String(session.user.app_metadata.role ?? ""));
        setAuthState(
          ["admin", "store_manager"].includes(String(session.user.app_metadata.role))
            ? "ready"
            : "not-admin"
        );
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const visibleAuthState =
    authState === "checking" && !getSupabaseBrowserClient()
      ? "unconfigured"
      : authState;

  if (visibleAuthState !== "ready") {
    const message =
      visibleAuthState === "unconfigured"
        ? "Supabase is not configured. Add the project URL and anon key to .env.local, then restart the development server."
        : visibleAuthState === "not-admin"
          ? "This account does not have CMS access. Ask the project owner to assign an admin or store_manager role."
          : visibleAuthState === "signed-out"
            ? "Redirecting to the secure admin sign-in pageâ€¦"
            : "Checking admin sessionâ€¦";

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="ui-card max-w-lg p-7 text-center">
          <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">
            Umer CMS
          </p>
          <h1 className="mt-3 text-xl font-black">
            {visibleAuthState === "unconfigured"
              ? "Backend setup required"
              : visibleAuthState === "not-admin"
                ? "Access not authorized"
                : "Secure admin access"}
          </h1>
          <p role="status" className="mt-3 text-sm leading-6 text-content-secondary">
            {message}
          </p>
          {authState === "unconfigured" && (
            <Link
              href="/admin/login"
              className="mt-5 inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-black text-brand-primary-foreground"
            >
              Go to setup instructions
            </Link>
          )}
        </section>
      </main>
    );
  }

  const adminOnlyPaths = [
    "/admin/accounts",
    "/admin/content",
    "/admin/banners",
    "/admin/settings",
  ];

  const isAdminOnlyPath = adminOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isAdminOnlyPath && userRole !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="ui-card max-w-lg p-7 text-center">
          <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">
            Umer CMS
          </p>
          <h1 className="mt-3 text-xl font-black">Admin access required</h1>
          <p role="status" className="mt-3 text-sm leading-6 text-content-secondary">
            Customer account records and role invitations are available only to CMS admins.
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-black text-brand-primary-foreground"
          >
            Back to store dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-950 p-5 text-white md:flex">
        <Link href="/admin" className="border-b border-white/10 px-3 pb-5">
          <p className="text-3xs font-black uppercase tracking-eyebrow-display text-lime-300">
            Store management
          </p>
          <span className="mt-1 block text-xl font-black">UMER CMS</span>
        </Link>
        <div className="mt-7 flex-1 overflow-y-auto">
          <NavigationLinks role={userRole} />
        </div>
        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100 shadow-inner shadow-amber-900/20">
          {status === "ready"
            ? "Shared CMS database connected"
            : status === "error"
              ? "CMS data sync needs attention"
              : "Supabase setup required"}
          <span className="mt-1 block text-amber-100/75">
            Products and website content are managed from the shared database.
          </span>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <Link href="/admin" className="text-lg font-black">
              UMER <span className="text-lime-700">CMS</span>
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-60"
            >
              {signingOut ? "Signing outâ€¦" : "Sign out"}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <NavigationLinks mobile role={userRole} />
          </div>
        </header>
        <div className="hidden h-12 items-center justify-between border-b border-slate-200 bg-white px-8 md:flex">
          <p className="text-xs font-bold uppercase tracking-eyebrow-wide text-slate-500">
            Umer Mobile Parts <span className="mx-2 text-lime-700">/</span> CMS
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-sm font-bold text-lime-700 transition hover:text-lime-800"
            >
              View storefront â†’
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="text-sm font-bold text-slate-600 transition hover:text-red-700 disabled:opacity-60"
            >
              {signingOut ? "Signing outâ€¦" : "Sign out"}
            </button>
          </div>
        </div>
        {signOutError && (
          <p
            role="alert"
            className="ui-feedback ui-feedback--error rounded-none border-x-0 border-t-0 px-4 py-2 md:px-8"
          >
            {signOutError}
          </p>
        )}
        <main className="admin-workspace min-h-screen">{children}</main>
      </div>
    </div>
  );
}

