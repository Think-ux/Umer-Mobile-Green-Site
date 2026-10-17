"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const configured = Boolean(getSupabaseBrowserClient());

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase is not configured. Follow the project setup instructions first.");
      return;
    }

    setBusy(true);
    if (resetMode) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/retailer/setup-password`,
      });
      if (resetError) {
        setError(`Could not send a password reset email: ${resetError.message}`);
      } else {
        setNotice("If an admin account exists for this email, a password reset link will arrive shortly.");
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

    if (data.user?.app_metadata.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account does not have CMS admin access.");
      setBusy(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
        <Link href="/" className="text-sm font-bold text-lime-700 hover:text-lime-800">
          ← Storefront
        </Link>
        <p className="mt-7 text-xs font-black uppercase tracking-eyebrow-prominent text-lime-700">
          Secure access
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Sign in to CMS</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in with the Supabase account assigned the CMS admin role.
        </p>

        {!configured && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Supabase connection details are missing. Set
            {" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> and
            {" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
            <code>.env.local</code> and restart the server.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </p>
        )}

        <form onSubmit={signIn} className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Email
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-primary"
            />
          </label>
          {!resetMode && (
            <label className="block text-sm font-bold text-slate-700">
              Password
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-primary"
              />
            </label>
          )}
          <button
            disabled={!configured || busy}
            className="w-full rounded-xl bg-brand-primary px-5 py-3.5 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {busy ? (resetMode ? "Sending link…" : "Signing in…") : (resetMode ? "Send password reset link" : "Sign in")}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setResetMode((current) => !current);
            setPassword("");
            setError("");
            setNotice("");
          }}
          className="mt-4 w-full text-center text-sm font-bold text-lime-800 hover:text-lime-900"
        >
          {resetMode ? "Back to sign in" : "Forgot your password?"}
        </button>
      </section>
    </main>
  );
}
