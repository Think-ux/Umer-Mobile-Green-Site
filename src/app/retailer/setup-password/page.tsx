"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function RetailerSetupPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [accountRole, setAccountRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const configured = Boolean(getSupabaseBrowserClient());

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    const verifySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) {
        setError(`Could not verify the invitation: ${sessionError.message}`);
        return;
      }
      if (!data.session) {
        setError("This password setup link is invalid or expired. Request a new password reset link.");
        return;
      }
      setAccountRole(String(data.session.user.app_metadata.role ?? ""));
      setReady(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || !session) return;
      setAccountRole(String(session.user.app_metadata.role ?? ""));
      setReady(true);
    });

    const code = new URLSearchParams(window.location.search).get("code");
    const initialize = async () => {
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        window.history.replaceState(null, "", window.location.pathname);
        if (exchangeError) {
          setError(`Could not verify the invitation: ${exchangeError.message}`);
          return;
        }
      }
      await verifySession();
    };
    void initialize();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function setAccountPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Retailer account setup is unavailable because the backend is not configured.");
      return;
    }

    setBusy(true);
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setError(sessionError?.message ?? "This password setup link is invalid or expired. Request a new password reset link.");
      setBusy(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(`Could not set your password: ${updateError.message}`);
      setBusy(false);
      return;
    }
    router.replace(accountRole === "retailer" ? "/retailer/dashboard" : "/account");
  }

  return (
    <main className="grid min-h-page-content place-items-center bg-slate-50 px-4 py-12">
      <section className="ui-card w-full max-w-md p-7 sm:p-9">
        <Link href="/retailer/login" className="text-sm font-bold text-lime-800 hover:text-lime-900">
          ← Retailer sign in
        </Link>
        <h1 className="mt-6 text-3xl font-black">Set your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a private password for your account. The store cannot see it.
        </p>
        {!configured && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Retailer account setup is unavailable because the backend is not configured.</p>}
        {configured && !ready && !error && <p role="status" className="mt-5 text-sm text-slate-500">Verifying your secure setup link…</p>}
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {ready && (
          <form onSubmit={setAccountPassword} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              New password
              <input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="ui-field mt-2" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Confirm password
              <input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="ui-field mt-2" />
            </label>
            <button disabled={busy} className="ui-button-primary w-full disabled:cursor-not-allowed disabled:bg-slate-300">
              {busy ? "Saving password…" : "Set password and continue"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
