"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type RetailerApplication = {
  id: number;
  owner_name: string;
  email: string;
  business_name: string;
  business_type: string;
  phone: string;
  address: string;
  city: string;
  business_details: string;
  required_document_path: string | null;
  decision_reason: string;
  status: "pending" | "approved" | "rejected" | "not_applicable";
  created_at: string;
};

export default function AdminRetailers() {
  const [applications, setApplications] = useState<RetailerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decisionReasons, setDecisionReasons] = useState<Record<number, string>>({});
  const [accessBusyId, setAccessBusyId] = useState<number | null>(null);

  const loadApplications = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Connect the database before managing retailer applications.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("retailer_applications")
      .select("id,owner_name,email,business_name,business_type,phone,address,city,business_details,required_document_path,decision_reason,status,created_at")
      .order("created_at", { ascending: false })
      .returns<RetailerApplication[]>();

    if (queryError) {
      setError(`Could not load retailer applications: ${queryError.message}`);
    } else {
      setApplications(data);
      setError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadApplications);
  }, [loadApplications]);

  async function updateStatus(application: RetailerApplication, status: RetailerApplication["status"]) {
    const decisionReason = status === "pending" ? "" : (decisionReasons[application.id] ?? "").trim();
    if (status !== "pending" && !decisionReason) {
      setError("Add a decision reason before approving, rejecting or marking an application not applicable.");
      return;
    }
    setBusyId(application.id);
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. No changes were saved.");
      setBusyId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("retailer_applications")
      .update({ status, decision_reason: decisionReason, updated_at: new Date().toISOString() })
      .eq("id", application.id);

    if (updateError) {
      setError(`Could not update retailer application: ${updateError.message}`);
    } else {
      setNotice(`${application.business_name} marked ${status}.`);
      await loadApplications();
    }

    setBusyId(null);
  }

  async function openDocument(application: RetailerApplication) {
    if (!application.required_document_path) {
      setError("This application has no uploaded business proof document.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. The document could not be opened.");
      return;
    }
    const documentWindow = window.open("about:blank", "_blank");
    if (!documentWindow) {
      setError("Allow pop-ups to open the private business proof document.");
      return;
    }
    const { data, error: linkError } = await supabase.storage
      .from("retailer-documents")
      .createSignedUrl(application.required_document_path, 60);
    if (linkError) {
      documentWindow.close();
      setError(`Could not open business proof document: ${linkError.message}`);
      return;
    }
    documentWindow.location.href = data.signedUrl;
  }

  async function sendAccessEmail(application: RetailerApplication) {
    setAccessBusyId(application.id);
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. No access email was sent.");
      setAccessBusyId(null);
      return;
    }

    const { data, error: accessError } = await supabase.functions.invoke("manage-retailer-access", {
      body: { applicationId: application.id },
    });
    if (accessError) {
      setError(`Could not set up retailer access: ${accessError.message}`);
      setAccessBusyId(null);
      return;
    }

    if (data?.status === "existing_account") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(application.email, {
        redirectTo: `${window.location.origin}/retailer/setup-password`,
      });
      if (resetError) {
        setError(`Retailer access is enabled, but the password email could not be sent: ${resetError.message}. Retry this action to resend it.`);
        setAccessBusyId(null);
        return;
      }
      setNotice(`Retailer access is enabled for ${application.email}; a password setup email has been sent.`);
    } else if (data?.status === "invited") {
      setNotice(`A retailer invitation with a secure password setup link has been sent to ${application.email}.`);
    } else {
      setError("Retailer access could not be confirmed. No success email was reported.");
      setAccessBusyId(null);
      return;
    }

    setAccessBusyId(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">Store operations</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Retailer applications</h1>
        <p className="mt-2 text-sm text-slate-500">Review applications and send secure account setup links. Retailers create their own passwords; admins never receive them.</p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        <div className="mt-7 space-y-3">
          {loading ? (
            <p role="status" className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Loading retailer applications…</p>
          ) : applications.length === 0 && !error ? (
            <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No retailer applications have been submitted yet.</p>
          ) : applications.map((application) => (
            <article key={application.id} className="rounded-2xl bg-slate-50 p-5">
              <div className="grid gap-4 md:grid-cols-admin-retailer-form md:items-start">
                <div>
                  <h2 className="font-black">{application.business_name}</h2>
                  <p className="text-sm text-slate-500">{application.owner_name} · {application.business_type.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-sm text-slate-600">{application.email} · {application.phone}</p>
                  <p className="mt-2 text-sm text-slate-600">{application.address}, {application.city}</p>
                  {application.business_details && <p className="mt-2 text-sm leading-6 text-slate-600">{application.business_details}</p>}
                  <p className="mt-2 text-xs text-slate-400">Applied {new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  application.status === "approved" ? "bg-green-100 text-green-700" :
                    application.status === "rejected" ? "bg-red-100 text-red-700" :
                      application.status === "not_applicable" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-700"
                }`}>{application.status}</span>
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={() => void openDocument(application)} className="w-fit rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-lime-800">
                    {application.required_document_path ? "View shop/business proof" : "No document"}
                  </button>
                  <label className="text-xs font-bold text-slate-600">
                    Decision reason (required for final decisions)
                    <textarea
                      maxLength={1000}
                      value={decisionReasons[application.id] ?? application.decision_reason ?? ""}
                      onChange={(event) => setDecisionReasons((current) => ({ ...current, [application.id]: event.target.value }))}
                      className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["approved", "rejected", "not_applicable", "pending"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={busyId === application.id || application.status === status}
                      onClick={() => void updateStatus(application, status)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold capitalize text-slate-700 hover:border-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyId === application.id ? "Saving…" : status}
                    </button>
                  ))}
                </div>
                {application.status === "approved" && (
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      disabled={busyId === application.id || accessBusyId === application.id}
                      onClick={() => void sendAccessEmail(application)}
                      className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-brand-primary-foreground hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {accessBusyId === application.id ? "Sending secure link…" : "Send password setup / reset email"}
                    </button>
                    <p className="mt-2 text-xs text-slate-500">New accounts receive an invitation. Existing customer accounts are enabled for retailer access and receive a password reset link.</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
