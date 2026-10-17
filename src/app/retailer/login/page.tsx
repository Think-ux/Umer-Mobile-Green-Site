"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isRetailerDemoEnabled, startRetailerDemoSession } from "@/lib/auth/retailer-demo";

export default function RetailerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const configured = Boolean(getSupabaseBrowserClient());
  const demoEnabled = isRetailerDemoEnabled();

  function enterDemoAccount() {
    setError("");
    try {
      startRetailerDemoSession();
      router.replace("/retailer/dashboard");
    } catch (demoError) {
      setError(demoError instanceof Error ? demoError.message : "Could not start retailer demo access.");
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Retailer sign-in is unavailable because the backend is not configured.");
      setBusy(false);
      return;
    }

    if (resetMode) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/retailer/setup-password`,
      });
      if (resetError) {
        setError(`Could not send a password setup email: ${resetError.message}`);
      } else {
        setNotice("If an account exists for this email, a password setup link will arrive shortly.");
      }
      setBusy(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }

    if (data.user?.app_metadata.role !== "retailer") {
      const { error: signOutError } = await supabase.auth.signOut();
      setError(
        signOutError
          ? `This account does not have retailer access. Sign-out also failed: ${signOutError.message}`
          : "This account does not have retailer access. Contact the store after your application is reviewed."
      );
      setBusy(false);
      return;
    }

    router.replace("/retailer/dashboard");
  }

  return (
    <main className="min-h-page-content bg-slate-50 px-4 py-14">
      <section className="mx-auto max-w-md">
        <Link href="/retailer" className="inline-flex items-center text-sm font-bold text-lime-800 hover:text-lime-900">
          ← Retailer information
        </Link>
        <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-7 shadow-lg shadow-slate-200/60 sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-xl font-black text-brand-primary-foreground">
            U
          </div>
          <h1 className="mt-5 text-center text-3xl font-black">Retailer sign in</h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600">
            Access is available only to accounts approved and assigned the retailer role.
          </p>

          {!configured && (
            demoEnabled ? (
              <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Supabase is not configured. Use the clearly marked demo account to preview the retailer area; demo access is unavailable in production.
              </p>
            ) : (
              <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                The retailer account service is not configured. Contact the store for assistance.
              </p>
            )
          )}
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

          <form onSubmit={signIn} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              Email
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-lime-500 focus:bg-white"
              />
            </label>
            {!resetMode && (
              <label className="block text-sm font-bold text-slate-700">
                Password
                <div className="relative mt-2">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-900 outline-none transition focus:border-lime-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-lime-800 hover:text-lime-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            )}
            <button disabled={!configured || busy} className="w-full rounded-xl bg-brand-primary px-5 py-3.5 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:bg-slate-300">
              {busy ? (resetMode ? "Sending link…" : "Signing in…") : (resetMode ? "Send password setup link" : "Sign in")}
            </button>
          </form>
          {demoEnabled && !resetMode && (
            <div className="mt-6 rounded-2xl border border-dashed border-lime-300 bg-lime-50 p-4">
              <p className="text-sm font-black text-lime-900">Testing only — demo retailer</p>
              <p className="mt-1 text-sm leading-6 text-lime-900">No Supabase account or password is used. Demo access stays in this browser and is disabled in production.</p>
              <button
                type="button"
                onClick={enterDemoAccount}
                className="mt-4 w-full rounded-xl border border-lime-300 bg-white px-4 py-3 text-sm font-black text-lime-900 transition hover:bg-lime-100"
              >
                Enter retailer demo
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setResetMode((current) => !current);
              setPassword("");
              setError("");
              setNotice("");
              setShowPassword(false);
            }}
            className="mt-4 w-full text-center text-sm font-bold text-lime-800 hover:text-lime-900"
          >
            {resetMode ? "Back to sign in" : "Forgot your password?"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Need retailer access?{" "}
            <Link href="/retailer/register" className="font-bold text-lime-800 hover:text-lime-900">
              Submit an application
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
