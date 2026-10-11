"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function RetailerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const configured = Boolean(getSupabaseBrowserClient());

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Retailer sign-in is unavailable because the backend is not configured.");
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
    <main className="min-h-[65vh] bg-slate-50 px-4 py-14">
      <section className="mx-auto max-w-md">
        <Link href="/retailer" className="text-sm font-bold text-orange-700 hover:text-orange-800">
          ← Retailer information
        </Link>
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white">U</div>
          <h1 className="mt-5 text-center text-3xl font-black">Retailer sign in</h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-600">
            Access is available only to accounts approved and assigned the retailer role.
          </p>

          {!configured && (
            <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              The retailer account service is not configured. Contact the store for assistance.
            </p>
          )}
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

          <form onSubmit={signIn} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              Email
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="ui-field mt-2"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Password
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="ui-field mt-2"
              />
            </label>
            <button disabled={!configured || busy} className="ui-button-primary w-full disabled:cursor-not-allowed disabled:bg-slate-300">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Need retailer access?{" "}
            <Link href="/retailer/register" className="font-bold text-orange-700 hover:text-orange-800">
              Submit an application
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
