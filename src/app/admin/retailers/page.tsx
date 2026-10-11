"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type RetailerApplication = {
  id: number;
  owner_name: string;
  business_name: string;
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

  const loadApplications = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Connect the database before managing retailer applications.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("retailer_applications")
      .select("id,owner_name,business_name,phone,address,city,business_details,required_document_path,decision_reason,status,created_at")
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Store operations</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Retailer applications</h1>
        <p className="mt-2 text-sm text-slate-500">Review and respond to retailer account requests.</p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        <div className="mt-7 space-y-3">
          {loading ? (
            <p role="status" className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Loading retailer applications…</p>
          ) : applications.length === 0 && !error ? (
            <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No retailer applications have been submitted yet.</p>
          ) : applications.map((application) => (
            <article key={application.id} className="rounded-2xl bg-slate-50 p-5">
              <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_auto] md:items-start">
                <div>
                  <h2 className="font-black">{application.business_name}</h2>
                  <p className="text-sm text-slate-500">{application.owner_name} · {application.phone}</p>
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
                  <button type="button" onClick={() => void openDocument(application)} className="w-fit rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-orange-700">
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
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold capitalize text-slate-700 hover:border-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyId === application.id ? "Saving…" : status}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
