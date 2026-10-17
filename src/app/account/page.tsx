"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  clearDevelopmentMockAccount,
  getDevelopmentMockAccount,
  isDevelopmentAuthMockEnabled,
  saveDevelopmentMockAccount,
  type DevelopmentMockAccount,
} from "@/lib/auth/development-mock";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type AccountStatus = "loading" | "ready" | "unconfigured";
type AccountMode = "sign-in" | "sign-up";
type AccountIdentity = {
  email?: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
};

function mockAccountIdentity(account: DevelopmentMockAccount): AccountIdentity {
  return {
    email: account.email,
    user_metadata: { full_name: account.fullName },
    app_metadata: { role: "customer" },
  };
}

function accountName(user: AccountIdentity) {
  const metadataName = [
    user.user_metadata.full_name,
    user.user_metadata.name,
    user.user_metadata.display_name,
  ].find((value): value is string => typeof value === "string" && value.trim().length > 0);

  return metadataName?.trim() || user.email || "Customer";
}

function accountRole(user: AccountIdentity) {
  if (user.app_metadata.role === "admin") {
    return { label: "Administrator", dashboard: "/admin", dashboardLabel: "Open admin CMS" };
  }
  if (user.app_metadata.role === "retailer") {
    return { label: "Retailer", dashboard: "/retailer/dashboard", dashboardLabel: "Open retailer dashboard" };
  }
  return { label: "Customer", dashboard: null, dashboardLabel: null };
}

export default function AccountPage() {
  const [status, setStatus] = useState<AccountStatus>(
    () => (
      isDevelopmentAuthMockEnabled() || getSupabaseBrowserClient()
        ? "loading"
        : "unconfigured"
    ),
  );
  const [user, setUser] = useState<AccountIdentity | null>(null);
  const [mode, setMode] = useState<AccountMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    if (isDevelopmentAuthMockEnabled()) {
      void Promise.resolve().then(() => {
        if (!active) return;
        try {
          const account = getDevelopmentMockAccount();
          if (account) setUser(mockAccountIdentity(account));
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the development account.",
          );
        }
        setStatus("ready");
      });

      return () => {
        active = false;
      };
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const client = supabase;

    async function loadAccount() {
      const { data, error: authError } = await client.auth.getSession();
      if (!active) return;

      if (authError) {
        setError(`Could not verify your account: ${authError.message}`);
      } else if (data.session?.user) {
        setUser(data.session.user);
      }
      setStatus("ready");
    }

    void loadAccount();
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    if (isDevelopmentAuthMockEnabled()) {
      try {
        const mockAccount: DevelopmentMockAccount = {
          email: email.trim(),
          fullName: name.trim(),
        };

        if (mode === "sign-up") {
          if (!mockAccount.fullName) {
            setError("Enter your name to create a development account.");
          } else {
            saveDevelopmentMockAccount(mockAccount);
            setUser(mockAccountIdentity(mockAccount));
            setNotice("Development account created locally. No email was sent.");
          }
        } else {
          const savedAccount = getDevelopmentMockAccount();
          if (!savedAccount) {
            setError("No local development account exists yet. Create one first.");
          } else if (savedAccount.email.toLowerCase() !== mockAccount.email.toLowerCase()) {
            setError("That email does not match the local development account.");
          } else {
            setUser(mockAccountIdentity(savedAccount));
            setNotice("Signed in to the local development account. No email was sent.");
          }
        }
      } catch (mockError) {
        setError(
          mockError instanceof Error
            ? mockError.message
            : "Could not access local development account storage.",
        );
      }
      setBusy(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Account sign-in is unavailable because Supabase is not configured.");
      setBusy(false);
      return;
    }

    if (mode === "sign-up") {
      const cleanName = name.trim();
      if (!cleanName) {
        setError("Enter your name to create an account.");
        setBusy(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: cleanName } },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.session && data.user) {
        setUser(data.user);
      } else {
        setMode("sign-in");
        setNotice("Account created. Check your email to confirm your address, then sign in.");
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else if (data.user) {
        setUser(data.user);
      }
    }

    setBusy(false);
  }

  async function signOut() {
    setBusy(true);
    setError("");
    setNotice("");
    if (isDevelopmentAuthMockEnabled()) {
      try {
        clearDevelopmentMockAccount();
        setUser(null);
        setPassword("");
        setNotice("Signed out of the local development account. No email was sent.");
      } catch (mockError) {
        setError(
          mockError instanceof Error
            ? mockError.message
            : "Could not sign out of the local development account.",
        );
      }
      setBusy(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured, so sign-out could not be completed.");
      setBusy(false);
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(`Could not sign out: ${signOutError.message}`);
    } else {
      setUser(null);
      setPassword("");
      setNotice("You have signed out.");
    }
    setBusy(false);
  }

  const role = user ? accountRole(user) : null;

  return (
    <main className="min-h-page-content bg-slate-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-bold text-lime-800 hover:text-lime-900">
          ← Storefront
        </Link>
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">
            Customer account
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            {user
              ? "Your account"
              : status === "ready"
                ? "You're browsing as a guest"
                : mode === "sign-in" ? "Sign in" : "Create an account"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {user
              ? "You are signed in. Your product ratings will use your account name."
              : "You are currently browsing as a guest. Sign in or create an account, or continue shopping as a guest."}
          </p>

          {status === "unconfigured" && (
            <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Customer accounts are unavailable because Supabase is not configured.
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
          {isDevelopmentAuthMockEnabled() && (
            <p role="status" className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
              Development mock is active. Sign-up and sign-in stay in this browser; no Supabase Auth request or email is sent. Passwords are not stored or checked.
            </p>
          )}

          {status === "loading" ? (
            <p role="status" className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Checking your account…
            </p>
          ) : user ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Signed in · {role?.label}
              </p>
              <p className="mt-2 text-lg font-black text-slate-900">{accountName(user)}</p>
              {user.email && <p className="mt-1 text-sm text-slate-600">{user.email}</p>}
              {role?.dashboard && (
                <Link
                  href={role.dashboard}
                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-brand-primary px-5 py-3 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover"
                >
                  {role.dashboardLabel}
                </Link>
              )}
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={busy}
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:border-lime-300 hover:text-lime-800 disabled:opacity-60"
              >
                {busy ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : (
            <>
              {status !== "unconfigured" && (
                <form onSubmit={submit} className="mt-6 space-y-4">
                  {mode === "sign-up" && (
                    <label className="block text-sm font-bold text-slate-700">
                      Your name
                      <input
                        required
                        minLength={1}
                        maxLength={120}
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="ui-field mt-2"
                      />
                    </label>
                  )}
                  <label className="block text-sm font-bold text-slate-700">
                    Email
                    <input
                      required
                      type="email"
                      autoComplete="email"
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
                      minLength={mode === "sign-up" ? 6 : undefined}
                      autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="ui-field mt-2"
                    />
                  </label>
                  <button
                    disabled={busy}
                    className="ui-button-primary w-full disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {busy
                      ? mode === "sign-up" ? "Creating account…" : "Signing in…"
                      : mode === "sign-up" ? "Create account" : "Sign in"}
                  </button>
                </form>
              )}
              {status !== "unconfigured" && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Retailer and administrator accounts sign in here too. Their work areas remain separate and are available after sign-in.
                </div>
              )}
              <Link
                href="/"
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:border-lime-300 hover:text-lime-800"
              >
                Continue as guest
              </Link>
              <p className="mt-6 text-center text-sm text-slate-600">
                {mode === "sign-in" ? "New to the store?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
                    setError("");
                    setNotice("");
                  }}
                  className="font-bold text-lime-800 hover:text-lime-900"
                >
                  {mode === "sign-in" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
