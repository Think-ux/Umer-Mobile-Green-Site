"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  endRetailerDemoSession,
  hasRetailerDemoSession,
  isRetailerDemoEnabled,
} from "@/lib/auth/retailer-demo";

type DashboardState = "checking" | "ready" | "signed-out" | "not-retailer" | "unconfigured" | "error";

export default function RetailerDashboard() {
  const router = useRouter();
  const [status, setStatus] = useState<DashboardState>("checking");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (isRetailerDemoEnabled()) {
      try {
        if (hasRetailerDemoSession()) {
          void Promise.resolve().then(() => {
            if (!active) return;
            setBusinessName("Demo Retailer");
            setStatus("ready");
          });
          return () => {
            active = false;
          };
        }
      } catch (demoError) {
        const message = demoError instanceof Error ? demoError.message : "Could not verify retailer demo access.";
        void Promise.resolve().then(() => {
          if (!active) return;
          setError(message);
          setStatus("error");
        });
        return () => {
          active = false;
        };
      }
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      void Promise.resolve().then(() => {
        if (active) setStatus("unconfigured");
      });
      return () => {
        active = false;
      };
    }

    const updateSession = (user: {
      app_metadata: Record<string, unknown>;
      user_metadata: Record<string, unknown>;
      email?: string;
    } | null) => {
      if (!active) return;
      if (!user) {
        setStatus("error");
        router.replace("/retailer/login");
        return;
      }
      if (user.app_metadata.role !== "retailer") {
        setStatus("not-retailer");
        return;
      }
      setBusinessName(
        typeof user.user_metadata.business_name === "string"
          ? user.user_metadata.business_name
          : user.email ?? "Retailer account"
      );
      setStatus("ready");
    };

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(`Could not verify retailer access: ${sessionError.message}`);
        setStatus("signed-out");
        return;
      }
      updateSession(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateSession(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function signOut() {
    if (isRetailerDemoEnabled()) {
      try {
        if (hasRetailerDemoSession()) {
          endRetailerDemoSession();
          router.replace("/retailer/login");
          return;
        }
      } catch (demoError) {
        setError(demoError instanceof Error ? demoError.message : "Could not end retailer demo access.");
        return;
      }
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("The account service is not configured, so sign-out could not be completed.");
      return;
    }
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(`Could not sign out: ${signOutError.message}`);
      return;
    }
    router.replace("/retailer/login");
  }

  if (status !== "ready") {
    const message =
      status === "checking" ? "Checking retailer access…" :
      status === "unconfigured" ? "Retailer account access is not configured. Contact the store for assistance." :
      status === "not-retailer" ? "This account does not have retailer access." :
      status === "error" ? "Could not verify retailer access." :
      "Redirecting to retailer sign in…";

    return (
      <main className="grid min-h-page-content place-items-center bg-slate-50 px-4 py-12">
        <section className="ui-card max-w-lg p-7 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-700">Retailer account</p>
          <h1 className="mt-3 text-2xl font-black">Access check</h1>
          <p role={error ? "alert" : "status"} className="mt-3 text-sm leading-6 text-slate-600">{error || message}</p>
          {(status === "unconfigured" || status === "not-retailer" || status === "error") && (
            <Link href="/retailer" className="ui-button-primary mt-5">Retailer information</Link>
          )}
        </section>
      </main>
    );
  }

  const overviewCards = [
    { label: "Pricing status", value: "Awaiting approval", tone: "lime" },
    { label: "Orders", value: isRetailerDemoEnabled() && hasRetailerDemoSession() ? "Sample data" : "Pending review", tone: "slate" },
    { label: "Account status", value: "Approved", tone: "emerald" },
  ];

  return (
    <main className="min-h-page-content bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-2xl shadow-slate-900/10">
          <div className="bg-[radial-gradient(circle_at_top_right,_rgba(198,255,0,0.18),transparent_30%),linear-gradient(135deg,#101612_0%,#171d1a_100%)] p-6 sm:p-9">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-lime-300">Retailer account</p>
            {isRetailerDemoEnabled() && hasRetailerDemoSession() && (
              <p className="mt-4 w-fit rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-200">
                Demo mode · sample data only · no Supabase
              </p>
            )}
            <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-black sm:text-4xl">Welcome, {businessName}</h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                  Your account has retailer access. Wholesale prices and ordering terms are being confirmed with the store.
                </p>
              </div>
              <button type="button" onClick={signOut} className="min-h-11 rounded-xl border border-white/20 px-5 py-3 font-bold text-white transition hover:bg-white/10">
                Sign out
              </button>
            </div>
          </div>
        </section>

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {overviewCards.map(({ label, value, tone }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-2xl font-black text-slate-900">{value}</span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                  tone === "lime" ? "bg-lime-100 text-lime-800" : tone === "emerald" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                }`}>
                  {tone}
                </span>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-black">Wholesale account setup</h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            This account area does not show estimated discounts, order totals, or wholesale checkout until the business pricing and order process are approved and configured.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/search" className="ui-button-primary">Browse current catalog</Link>
            {isRetailerDemoEnabled() && hasRetailerDemoSession() && (
              <Link href="/retailer/orders" className="inline-flex min-h-11 items-center rounded-xl border border-lime-300/30 bg-lime-50 px-5 py-3 font-bold text-lime-900 transition hover:bg-lime-100">
                View sample retailer orders
              </Link>
            )}
            <Link href="/customer-care" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-800 transition hover:border-lime-300 hover:text-lime-800">
              Ask about wholesale terms
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
