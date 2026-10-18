"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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

type AccountSource =
  | "registered"
  | "retailer-applications"
  | "guest-orders";

type AccountsResponse = {
  records: Account[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  source: AccountSource;
};

const sources: {
  id: AccountSource;
  label: string;
  description: string;
}[] = [
  {
    id: "registered",
    label: "Registered accounts",
    description:
      "Customer logins and provisioned retailer or CMS team accounts.",
  },
  {
    id: "retailer-applications",
    label: "Retailer applications",
    description:
      "Review retailer applicants and their current application status.",
  },
  {
    id: "guest-orders",
    label: "Guest checkout",
    description:
      "Contact records from orders placed without signing in.",
  },
];

const inputClass =
  "mt-2 block h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-500/15 disabled:cursor-not-allowed disabled:opacity-50";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function roleLabel(role: string) {
  if (role === "store_manager") return "Store Manager";
  if (role === "admin") return "CMS Admin";
  if (role === "retailer") return "Retailer";
  if (!role) return "Customer";

  return role.replaceAll("_", " ");
}

function roleBadgeClass(role: string) {
  if (role === "admin") {
    return "bg-violet-50 text-violet-700 ring-violet-600/15";
  }

  if (role === "store_manager") {
    return "bg-blue-50 text-blue-700 ring-blue-600/15";
  }

  if (role === "retailer") {
    return "bg-lime-50 text-lime-800 ring-lime-600/15";
  }

  return "bg-slate-100 text-slate-700 ring-slate-500/10";
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [source, setSource] =
    useState<AccountSource>("registered");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] =
    useState<"admin" | "store_manager">("store_manager");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteNotice, setInviteNotice] = useState("");

  const loadAccounts = useCallback(
    async (
      requestedPage: number,
      requestedSource: AccountSource,
    ) => {
      setLoading(true);
      setError("");

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setAccounts([]);
        setError(
          "Supabase is not configured. Account records could not be loaded.",
        );
        setLoading(false);
        return;
      }

      try {
        const { data, error: invokeError } =
          await supabase.functions.invoke<AccountsResponse>(
            "list-customer-accounts",
            {
              body: {
                page: requestedPage,
                source: requestedSource,
              },
            },
          );

        if (invokeError) {
          setAccounts([]);
          setError(
            `Could not load account records: ${invokeError.message}`,
          );
          setLoading(false);
          return;
        }

        if (
          !data ||
          !Array.isArray(data.records) ||
          data.source !== requestedSource ||
          !Number.isInteger(data.page) ||
          typeof data.hasMore !== "boolean"
        ) {
          setAccounts([]);
          setError(
            "The account service returned an invalid response.",
          );
          setLoading(false);
          return;
        }

        setAccounts(data.records);
        setSource(data.source);
        setPage(data.page);
        setHasMore(data.hasMore);
      } catch {
        setAccounts([]);
        setError(
          "A network error occurred while loading account records.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadAccounts(1, "registered");
  }, [loadAccounts]);

  const visibleAccounts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) return accounts;

    return accounts.filter((account) =>
      [
        account.name,
        account.email,
        account.phone,
        account.role,
        account.status,
        account.city,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [accounts, search]);

  async function inviteCmsUser(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (inviteBusy) return;

    setInviteBusy(true);
    setError("");
    setInviteNotice("");

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError(
        "Supabase is not configured. No invitation was sent.",
      );
      setInviteBusy(false);
      return;
    }

    const email = inviteEmail.trim().toLowerCase();

    try {
      const { data, error: inviteError } =
        await supabase.functions.invoke<{
          status: string;
          role: "admin" | "store_manager";
        }>("invite-cms-user", {
          body: {
            email,
            role: inviteRole,
          },
        });

      if (inviteError) {
        setError(
          `Could not send the invitation: ${inviteError.message}`,
        );
        return;
      }

      if (
        data?.status !== "invited" ||
        data.role !== inviteRole
      ) {
        setError(
          "The invitation could not be confirmed. Please verify the result before retrying.",
        );
        return;
      }

      setInviteEmail("");
      setInviteNotice(
        `Setup invitation sent to ${email} for the ${roleLabel(inviteRole)} role.`,
      );

      await loadAccounts(1, "registered");
    } catch {
      setError(
        "A network error occurred while sending the invitation.",
      );
    } finally {
      setInviteBusy(false);
    }
  }

  return (
    <main className="min-w-0 w-full">
      <div className="mx-auto w-full max-w-[1440px] min-w-0 space-y-7 p-4 sm:p-6 lg:p-8">
        {/* Page heading */}
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-lime-700">
              Customer management
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Customer Accounts
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage account records, retailer applications,
              guest checkout contacts, and CMS team invitations
              from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAccounts(1, source)}
            disabled={loading}
            className={secondaryButtonClass}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7v5h-5M4 17v-5h5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"
              />
            </svg>
            Refresh records
          </button>
        </header>

        {/* CMS invitation */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-50 text-lime-800 ring-1 ring-lime-100">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  />
                  <circle cx="10" cy="7" r="4" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 8v6m-3-3h6"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black tracking-tight text-slate-950">
                  Create CMS account
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Invite a team member using their email.
                  They will receive a secure setup link to
                  create their password.
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0 p-5 sm:p-7">
            {inviteNotice && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <span className="mt-0.5 font-black">✓</span>
                <p className="min-w-0 flex-1 leading-6">
                  {inviteNotice}
                </p>
              </div>
            )}

            <form
              onSubmit={inviteCmsUser}
              className="grid min-w-0 grid-cols-1 items-end gap-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px_auto]"
            >
              <label className="block min-w-0 text-sm font-bold text-slate-700">
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={inviteEmail}
                  onChange={(event) =>
                    setInviteEmail(event.target.value)
                  }
                  placeholder="name@example.com"
                  className={inputClass}
                  disabled={inviteBusy}
                />
              </label>

              <label className="block min-w-0 text-sm font-bold text-slate-700">
                Account role
                <select
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(
                      event.target.value as
                        | "admin"
                        | "store_manager",
                    )
                  }
                  className={inputClass}
                  disabled={inviteBusy}
                >
                  <option value="store_manager">
                    Store Manager
                  </option>
                  <option value="admin">CMS Admin</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={inviteBusy || !inviteEmail.trim()}
                className="inline-flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-lime-400 px-5 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-lime-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-500/20 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
              >
                {inviteBusy ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900"
                    />
                    Sending...
                  </>
                ) : (
                  "Send setup invitation"
                )}
              </button>
            </form>

            <div className="mt-6 flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 12 2 2 4-4"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold text-slate-800">
                  Security and access
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  The recipient sets their own password
                  through the emailed link. Only CMS admins
                  should be able to invite team members and
                  view customer records. The initial CMS admin
                  must be assigned by the project owner in
                  Supabase.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Errors */}
        {error && (
          <div
            role="alert"
            className="flex min-w-0 items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span className="font-black">!</span>
            <p className="min-w-0 flex-1 leading-6">{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="shrink-0 rounded-lg px-2 py-1 font-bold hover:bg-red-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Account records continues in Part 2 */}
        {/* Account source tabs */}
        <section className="min-w-0 space-y-4">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              Account records
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Browse registered users, retailer applications,
              and guest checkout contacts.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Account categories"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {sources.map((option) => {
              const active = source === option.id;

              return (
                <button
                  key={option.id}
                  id={`account-tab-${option.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="account-records"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                    void loadAccounts(1, option.id);
                  }}
                  className={`min-w-0 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime-500/15 ${
                    active
                      ? "border-lime-400 bg-lime-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span
                      className={`text-sm font-extrabold ${
                        active
                          ? "text-slate-950"
                          : "text-slate-700"
                      }`}
                    >
                      {option.label}
                    </span>

                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                        active
                          ? "bg-lime-200 text-lime-900"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {active ? "✓" : "→"}
                    </span>
                  </span>

                  <span className="mt-2 block text-xs leading-5 text-slate-500">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Search and refresh controls */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <label className="block min-w-0 flex-1 text-sm font-bold text-slate-700 lg:max-w-xl">
              Search records
              <span className="relative mt-2 block">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16 16 4 4"
                  />
                </svg>

                <input
                  id="account-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Name, email, phone, role or city"
                  className="block h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10"
                />
              </span>
            </label>

            <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-end">
              <p
                className="min-w-0 text-xs leading-5 text-slate-500"
                aria-live="polite"
              >
                {loading
                  ? "Loading records..."
                  : `${visibleAccounts.length} shown on this page`}
              </p>

              <button
                type="button"
                onClick={() => void loadAccounts(1, source)}
                disabled={loading}
                className={secondaryButtonClass}
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Records table */}
        <section
          id="account-records"
          role="tabpanel"
          aria-labelledby={`account-tab-${source}`}
          className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900">
                {sources.find((item) => item.id === source)?.label}
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Page {page}
                {hasMore ? " · More records available" : " · End of results"}
              </p>
            </div>

            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="self-start rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 sm:self-auto"
              >
                Clear search
              </button>
            )}
          </div>

          {loading ? (
            <div
              role="status"
              className="flex min-h-56 flex-col items-center justify-center gap-3 p-8 text-center"
            >
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-lime-600" />
              <p className="text-sm font-semibold text-slate-600">
                Loading account records...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-40 flex-col items-center justify-center p-6 text-center">
              <p className="text-sm font-bold text-slate-700">
                Records could not be loaded.
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Review the error above and try again.
              </p>
              <button
                type="button"
                onClick={() => void loadAccounts(1, source)}
                className={`${secondaryButtonClass} mt-4`}
              >
                Try again
              </button>
            </div>
          ) : visibleAccounts.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16 16 4 4M8 10.5h5"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                {accounts.length > 0
                  ? "No matching records"
                  : source === "registered"
                    ? "No registered accounts found"
                    : source === "retailer-applications"
                      ? "No retailer applications found"
                      : "No guest checkout records found"}
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {accounts.length > 0
                  ? "Try another search term or clear your search."
                  : "Records will appear here when they are available in the connected database."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 text-sm font-bold text-lime-800 underline underline-offset-4"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop and tablet table */}
              <div className="hidden w-full overflow-x-auto md:block">
                <table className="w-full min-w-[1000px] table-auto border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th scope="col" className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Customer
                      </th>
                      <th scope="col" className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>
                      <th scope="col" className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Role
                      </th>
                      <th scope="col" className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Status / details
                      </th>
                      <th scope="col" className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Registered
                      </th>
                      <th scope="col" className="px-5 py-4 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        Last sign-in
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleAccounts.map((account) => (
                      <tr
                        key={account.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="max-w-[230px] px-5 py-4 align-top">
                          <p className="break-words font-bold text-slate-900">
                            {account.name || "Unnamed customer"}
                          </p>
                          {account.city && (
                            <p className="mt-1 break-words text-xs text-slate-500">
                              {account.city}
                            </p>
                          )}
                        </td>

                        <td className="max-w-[260px] px-5 py-4 align-top">
                          <p className="break-all text-slate-700">
                            {account.email || "—"}
                          </p>
                          {account.phone && (
                            <p className="mt-1 break-words text-xs text-slate-500">
                              {account.phone}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1.5 text-xs font-bold ring-1 ring-inset ${roleBadgeClass(account.role)}`}
                          >
                            {roleLabel(account.role)}
                          </span>
                        </td>

                        <td className="max-w-[240px] px-5 py-4 align-top">
                          <p className="break-words font-semibold text-slate-800">
                            {account.status || "—"}
                          </p>
                          {account.details && (
                            <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                              {account.details}
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 align-top text-slate-600">
                          {formatDate(account.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 align-top text-slate-600">
                          {source !== "registered"
                            ? "—"
                            : formatDate(account.lastSignInAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile account cards */}
              <div className="grid min-w-0 grid-cols-1 gap-0 divide-y divide-slate-100 md:hidden">
                {visibleAccounts.map((account) => (
                  <article
                    key={account.id}
                    className="min-w-0 space-y-4 p-4 sm:p-5"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="break-words text-sm font-extrabold text-slate-950">
                          {account.name || "Unnamed customer"}
                        </h4>
                        {account.city && (
                          <p className="mt-1 break-words text-xs text-slate-500">
                            {account.city}
                          </p>
                        )}
                      </div>

                      <span
                        className={`inline-flex max-w-[48%] shrink-0 items-center rounded-full px-2.5 py-1.5 text-center text-xs font-bold ring-1 ring-inset ${roleBadgeClass(account.role)}`}
                      >
                        {roleLabel(account.role)}
                      </span>
                    </div>

                    <dl className="grid min-w-0 grid-cols-1 gap-3">
                      <div className="min-w-0">
                        <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Email
                        </dt>
                        <dd className="mt-1 break-all text-sm text-slate-700">
                          {account.email || "—"}
                        </dd>
                      </div>

                      <div className="min-w-0">
                        <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Phone
                        </dt>
                        <dd className="mt-1 break-words text-sm text-slate-700">
                          {account.phone || "—"}
                        </dd>
                      </div>

                      <div className="min-w-0">
                        <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Status / details
                        </dt>
                        <dd className="mt-1 break-words text-sm text-slate-700">
                          {account.status || "—"}
                          {account.details && (
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                              {account.details}
                            </span>
                          )}
                        </dd>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="min-w-0">
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Registered
                          </dt>
                          <dd className="mt-1 text-sm text-slate-700">
                            {formatDate(account.createdAt)}
                          </dd>
                        </div>

                        <div className="min-w-0">
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Last sign-in
                          </dt>
                          <dd className="mt-1 text-sm text-slate-700">
                            {source !== "registered"
                              ? "—"
                              : formatDate(account.lastSignInAt)}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Pagination */}
        <nav
          aria-label="Account record pagination"
          className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <p className="text-sm text-slate-500">
            Page <span className="font-extrabold text-slate-900">{page}</span>
            {" · "}
            {hasMore
              ? "More records available"
              : "No further pages reported"}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void loadAccounts(Math.max(1, page - 1), source)
              }
              disabled={loading || page <= 1}
              className={`${secondaryButtonClass} flex-1 sm:flex-none`}
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() => void loadAccounts(page + 1, source)}
              disabled={loading || !hasMore}
              className={`${secondaryButtonClass} flex-1 sm:flex-none`}
            >
              Next →
            </button>
          </div>
        </nav>

        <footer className="pb-2 text-center text-xs leading-5 text-slate-400">
          Customer Accounts · Umer CMS
        </footer>
      </div>
    </main>
  );
}
