"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function RetailerRegister() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Your application has not been submitted.");
      setBusy(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const documentFile = formData.get("required_document");
    if (!(documentFile instanceof File) || documentFile.size === 0) {
      setError("Upload your required shop/business proof document.");
      setBusy(false);
      return;
    }
    const extensions: Record<string, string> = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
    };
    const extension = extensions[documentFile.type];
    if (!extension || documentFile.size > 10 * 1024 * 1024) {
      setError("Choose a PDF, JPG or PNG shop/business proof document smaller than 10 MB.");
      setBusy(false);
      return;
    }
    const documentPath = `applications/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("retailer-documents")
      .upload(documentPath, documentFile, {
        contentType: documentFile.type,
        upsert: false,
      });
    if (uploadError) {
      setError(`Could not upload required document: ${uploadError.message}`);
      setBusy(false);
      return;
    }
    const { error: insertError } = await supabase.from("retailer_applications").insert({
      owner_name: String(formData.get("owner_name") ?? "").trim(),
      business_name: String(formData.get("business_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      business_details: String(formData.get("business_details") ?? "").trim(),
      required_document_path: documentPath,
      status: "pending",
    });

    if (insertError) {
      const { error: cleanupError } = await supabase.storage
        .from("retailer-documents")
        .remove([documentPath]);
      setError(cleanupError
        ? `Could not submit your application (${insertError.message}); uploaded document cleanup also failed (${cleanupError.message}).`
        : `Could not submit your application: ${insertError.message}`);
      setBusy(false);
      return;
    }

    setNotice("Application and required document submitted. Your application is under review.");
    router.push("/retailer/pending");
  }

  return (
      <section className="mx-auto max-w-2xl px-4 py-14">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-orange-500">Retailer Application</p>
          <h1 className="mt-2 text-4xl font-black">Become a Umer retailer</h1>
          <p className="mt-3 text-slate-500">Tell us about your business. The team will review your application and confirm any retailer terms directly.</p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={submitApplication} className="grid gap-5">
            <label className="text-sm font-bold text-slate-700">
              Owner full name
              <input name="owner_name" required maxLength={120} autoComplete="name" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Shop / business name
              <input name="business_name" required maxLength={160} autoComplete="organization" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Phone number
              <input name="phone" required maxLength={40} type="tel" autoComplete="tel" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Shop address
              <input name="address" required maxLength={300} autoComplete="street-address" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              City
              <input name="city" required maxLength={120} autoComplete="address-level2" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Tell us briefly about your business
              <textarea name="business_details" maxLength={2000} className="mt-2 min-h-32 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Shop/business proof document (required · PDF, JPG or PNG · max 10 MB)
              <input required name="required_document" type="file" accept="application/pdf,image/jpeg,image/png" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="rounded-xl bg-orange-500 px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">
              {busy ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already approved? <Link href="/retailer/login" className="font-bold text-orange-600">Login here</Link>
        </p>
      </section>
  );
}
