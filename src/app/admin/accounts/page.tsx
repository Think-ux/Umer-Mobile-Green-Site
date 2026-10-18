"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Account = {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: string;
  status: string;
  details: string;
  city: string;
  createdAt: string;
  lastSignInAt: string | null;
};

type AccountSource = "registered" | "retailer-applications" | "guest-orders";

type AccountsResponse = {
  records: Account[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  source: AccountSource;
};

const sources: { id: AccountSource; label: string; description: string }[] = [
  { id: "registered", label: "Registered accounts", description: "Supabase Auth customers and provisioned retailer accounts." },
  { id: "retailer-applications", label: "Retailer applications", description: "Applicants are shown here before and after approval; approval alone does not create a login." },
  { id: "guest-orders", label: "Guest checkout", description: "Customers who submitted checkout without signing in. Browsing without an order does not create a guest account." },
];

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [source, setSource] = useState<AccountSource>("registered");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "store_manager">("store_manager");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteNotice, setInviteNotice] = useState("");

  const loadAccounts = useCallback(async (requestedPage: number, requestedSource: AccountSource) => {
    setLoading(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Registered accounts cannot be loaded.");
      setLoading(false);
      return;
    }

    const { data, error: invokeError } = await supabase.functions.invoke<AccountsResponse>(
      "list-customer-accounts",
      { body: { page: requestedPage, source: requestedSource } },
    );
    if (invokeError) {
      setError(`Could not load registered accounts: ${invokeError.message}`);
      setLoading(false);
      return;
    }
    if (!data || !Array.isArray(data.records) || data.source !== requestedSource) {
      setError("The account service returned an invalid response.");
      setLoading(false);
      return;
    }

    setAccounts(data.records);
    setSource(data.source);
    setPage(data.page);
    setHasMore(data.hasMore);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadAccounts(1, "registered"));
  }, [loadAccounts]);

  const visibleAccounts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return accounts;
    return accounts.filter((account) =>
      `${account.name} ${account.email} ${account.role}`.toLocaleLowerCase().includes(query),
    );
  }, [accounts, search]);

  async function inviteCmsUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteBusy(true);
    setError("");
    setInviteNotice("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. No admin invitation was sent.");
      setInviteBusy(false);
      return;
    }

    const email = inviteEmail.trim().toLowerCase();
    const { data, error: inviteError } = await supabase.functions.invoke<{
      status: string;
      role: "admin" | "store_manager";
    }>(
      "invite-cms-user",
      { body: { email, role: inviteRole } },
    );
    if (inviteError) {
      setError(`Could not send the CMS invitation: ${inviteError.message}`);
      setInviteBusy(false);
      return;
    }
    if (data?.status !== "invited" || data.role !== inviteRole) {
      setError("The CMS invitation could not be confirmed. No success was reported.");
      setInviteBusy(false);
      return;
    }

    setInviteEmail("");
    setInviteNotice(
      `A ${inviteRole === "admin" ? "CMS admin" : "store manager"} setup invitation has been sent to ${email}.`,
    );
    setSource("registered");
    await loadAccounts(1, "registered");
    setInviteBusy(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">Store accounts</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Registered accounts</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          View registered Supabase accounts, retailer applications, and guest checkout contacts. Guest checkout does not create a login, and browsing without signing in or ordering creates no account record.
        </p>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-black">Create account</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Create a CMS admin or store manager account by sending a secure setup link. The recipient sets their own password from the email.
          </p>
          {inviteNotice && <p role="status" className="ui-feedback ui-feedback--success mt-4">{inviteNotice}</p>}
          <form onSubmit={inviteCmsUser} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1 text-sm font-bold text-slate-700">
              Email
              <input
                required
                type="email"
                autoComplete="email"
                maxLength={254}
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="ui-field mt-2"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Role
              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as "admin" | "store_manager")}
                className="ui-field mt-2"
              >
                <option value="store_manager">Store manager</option>
                <option value="admin">CMS admin</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={inviteBusy}
              className="ui-button-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {inviteBusy ? "Sending invitation…" : "Send setup invitation"}
            </button>
          </form>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            The first CMS admin must be created and assigned the admin role by the project owner in Supabase. Managers cannot view customer account records or invite users.
          </p>
        </section>

        {error && <p role="alert" className="ui-feedback ui-feedback--error mt-5">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Account records">
          {sources.map((option) => (
            <button
              key={option.id}
              id={`account-tab-${option.id}`}
              type="button"
              role="tab"
              aria-selected={source === option.id}
              aria-controls="account-records"
              onClick={() => {
                setSource(option.id);
                setPage(1);
                setSearch("");
                void loadAccounts(1, option.id);
              }}
              className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                source === option.id
                  ? "border-brand-primary bg-brand-primary text-brand-primary-foreground"
                  : "border-slate-200 bg-white text-slate-700 hover:border-lime-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {sources.find((option) => option.id === source)?.description}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="sr-only" htmlFor="account-search">Search accounts</label>
          <input
            id="account-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or role"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm sm:max-w-md"
          />
          <button
            type="button"
            onClick={() => void loadAccounts(1, source)}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div id="account-records" role="tabpanel" aria-labelledby={`account-tab-${source}`} className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <p role="status" className="p-6 text-sm text-slate-500">Loading records…</p>
          ) : visibleAccounts.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">{accounts.length ? "No records match your search." : source === "registered" ? "No registered Auth accounts were found on this page." : source === "retailer-applications" ? "No retailer applications were found on this page." : "No guest checkout orders were found on this page."}</p>
          ) : (
            <table className="w-full min-w-order-table border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-black">Name</th>
                  <th className="px-5 py-4 font-black">Email</th>
                  <th className="px-5 py-4 font-black">Phone</th>
                  <th className="px-5 py-4 font-black">Role</th>
                  <th className="px-5 py-4 font-black">Status / details</th>
                  <th className="px-5 py-4 font-black">Registered</th>
                  <th className="px-5 py-4 font-black">Last sign-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleAccounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-5 py-4 font-bold text-slate-900">{account.name || "—"}</td>
                    <td className="px-5 py-4 text-slate-700">{account.email || "—"}</td>
                    <td className="px-5 py-4 text-slate-700">{account.phone || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                        account.role === "admin" ? "bg-violet-100 text-violet-800" :
                        account.role === "store_manager" ? "bg-blue-100 text-blue-800" :
                        account.role === "retailer" ? "bg-lime-100 text-lime-900" :
                        "bg-slate-100 text-slate-700"
                      }`}>{account.role === "store_manager" ? "Store Manager" : account.role}</span>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-slate-600">
                      <span className="font-bold">{account.status}</span>
                      {account.details && <span className="mt-1 block text-xs">{account.details}</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{new Date(account.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-slate-600">{source !== "registered" ? "—" : account.lastSignInAt ? new Date(account.lastSignInAt).toLocaleDateString() : "Never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => void loadAccounts(Math.max(1, page - 1), source)}
            disabled={loading || page <= 1}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page}</span>
          <button
            type="button"
            onClick={() => void loadAccounts(page + 1, source)}
            disabled={loading || !hasMore}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
