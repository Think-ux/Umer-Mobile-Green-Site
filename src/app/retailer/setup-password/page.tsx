"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type VerificationType = "invite" | "recovery";

export default function RetailerSetupPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [accountRole, setAccountRole] = useState("");
  const [pendingVerification, setPendingVerification] = useState<{
    tokenHash: string;
    type: VerificationType;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const configured = Boolean(getSupabaseBrowserClient());

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    const initialize = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      const linkError = params.get("error_description")
        ?? new URLSearchParams(window.location.hash.slice(1)).get("error_description");
      if (linkError) {
        setError(`The password link could not be verified: ${linkError}`);
        return;
      }

      if (tokenHash) {
        if (type !== "invite" && type !== "recovery") {
          setError("This password setup link has an invalid type. Request a new password reset link.");
          return;
        }
        setPendingVerification({ tokenHash, type });
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (exchangeError) {
          setError(`Could not verify the password link: ${exchangeError.message}`);
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) {
        setError(`Could not verify the password link: ${sessionError.message}`);
        return;
      }
      if (!data.session) {
        setError("This password setup link is invalid or expired. Request a new password reset link.");
        return;
      }
      setAccountRole(String(data.session.user.app_metadata.role ?? ""));
      setReady(true);
    };
    void initialize();

    return () => {
      active = false;
    };
  }, []);

  async function verifyPasswordLink() {
    if (!pendingVerification) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Password setup is unavailable because the backend is not configured.");
      return;
    }

    setBusy(true);
    setError("");
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: pendingVerification.tokenHash,
      type: pendingVerification.type,
    });
    if (verifyError || !data.user) {
      setError(`Could not verify the password link: ${verifyError?.message ?? "Supabase returned no account."}`);
      setBusy(false);
      return;
    }

    setAccountRole(String(data.user.app_metadata.role ?? ""));
    setReady(true);
    setPendingVerification(null);
    window.history.replaceState(null, "", window.location.pathname);
    setBusy(false);
  }

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
    router.replace(
      accountRole === "admin"
        || accountRole === "store_manager"
        ? "/admin"
        : accountRole === "retailer"
          ? "/retailer/dashboard"
          : "/account"
    );
  }

  const isAdmin = accountRole === "admin" || accountRole === "store_manager";

  return (
    <main className="grid min-h-page-content place-items-center bg-slate-50 px-4 py-12">
      <section className="ui-card w-full max-w-md p-7 sm:p-9">
        <Link href={isAdmin ? "/admin/login" : "/retailer/login"} className="text-sm font-bold text-lime-800 hover:text-lime-900">
          {isAdmin ? "← Admin sign in" : "← Retailer sign in"}
        </Link>
        <h1 className="mt-6 text-3xl font-black">{isAdmin ? "Reset your password" : "Set your password"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isAdmin
            ? "Choose a new password for your secure CMS admin account."
            : "Choose a private password for your account. The store cannot see it."}
        </p>
        {!configured && <p role="alert" className="ui-feedback ui-feedback--warning mt-5">Retailer account setup is unavailable because the backend is not configured.</p>}
        {configured && !ready && !error && <p role="status" className="mt-5 text-sm text-slate-500">Verifying your secure setup link…</p>}
        {error && <p role="alert" className="ui-feedback ui-feedback--error mt-5">{error}</p>}
        {pendingVerification && !ready && (
          <div className="mt-6">
            <p className="text-sm leading-6 text-slate-600">
              Your secure link is ready. Continue to verify it and choose a password.
            </p>
            <button
              type="button"
              onClick={() => void verifyPasswordLink()}
              disabled={busy}
              className="ui-button-primary mt-4 w-full disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {busy ? "Verifying link…" : "Verify link and continue"}
            </button>
          </div>
        )}
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
              {busy ? "Saving password…" : isAdmin ? "Save password and open CMS" : "Set password and continue"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
