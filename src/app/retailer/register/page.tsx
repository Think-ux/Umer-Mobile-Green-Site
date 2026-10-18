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
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const businessType = String(formData.get("business_type") ?? "");
    if (!email || !formData.has("terms_accepted")) {
      setError("Enter your email address and accept the application terms before submitting.");
      setBusy(false);
      return;
    }
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
      email,
      business_name: String(formData.get("business_name") ?? "").trim(),
      business_type: businessType,
      phone: String(formData.get("phone") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      city: String(formData.get("city") ?? "").trim(),
      business_details: String(formData.get("business_details") ?? "").trim(),
      required_document_path: documentPath,
      terms_accepted: true,
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

    setNotice("Application and required document submitted. Your application is under review. If approved, you will receive a secure email link to set your password.");
    router.push("/retailer/pending");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14">
      <section className="mx-auto max-w-3xl">
        <Link href="/retailer" className="inline-flex items-center text-sm font-bold text-lime-800 hover:text-lime-900">
          ← Back to retailer information
        </Link>

        <div className="mt-6 rounded-card border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 md:p-8">
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-eyebrow-wide text-lime-700">
              Retailer application
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Become a Umer retailer</h1>
            <p className="mt-3 text-slate-600">
              Share your business and contact details so the team can review your application. Wholesale terms will be discussed separately.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-lime-200 bg-lime-50 p-4 text-sm leading-6 text-lime-900">
            Required documents: PDF, JPG, or PNG business proof under 10 MB.
            Approval is subject to review and store confirmation of wholesale terms.
          </div>

          <form onSubmit={submitApplication} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                Owner full name
                <input name="owner_name" required maxLength={120} autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-lime-500 focus:bg-white" />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Business contact email
                <input name="email" required type="email" maxLength={254} autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-lime-500 focus:bg-white" />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                Shop / business name
                <input name="business_name" required maxLength={160} autoComplete="organization" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-lime-500 focus:bg-white" />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Type of business
                <select name="business_type" required defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-lime-500 focus:bg-white">
                  <option value="" disabled>Select your business type</option>
                  <option value="repair_shop">Mobile repair shop</option>
                  <option value="mobile_parts_retailer">Mobile parts retailer / wholesaler</option>
                  <option value="online_seller">Online seller</option>
                  <option value="other">Other related business</option>
                </select>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                Phone number
                <input name="phone" required maxLength={40} type="tel" autoComplete="tel" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-lime-500 focus:bg-white" />
              </label>
              <label className="text-sm font-bold text-slate-700">
                City
                <input name="city" required maxLength={120} autoComplete="address-level2" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-lime-500 focus:bg-white" />
              </label>
            </div>

            <label className="text-sm font-bold text-slate-700">
              Shop address
              <input name="address" required maxLength={300} autoComplete="street-address" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-lime-500 focus:bg-white" />
            </label>

            <label className="text-sm font-bold text-slate-700">
              What parts or products are you interested in?
              <textarea name="business_details" maxLength={2000} placeholder="For example: screens, batteries, charging parts, brands/models, or the products you usually source." className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-lime-500 focus:bg-white" />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Shop/business proof document
              <input required name="required_document" type="file" accept="application/pdf,image/jpeg,image/png" className="mt-2 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-lime-100 file:px-3 file:py-2 file:font-bold file:text-lime-900 hover:file:bg-lime-200" />
            </label>

            <label className="flex items-start gap-3 text-sm font-normal leading-6 text-slate-600">
              <input required name="terms_accepted" type="checkbox" value="true" className="mt-1 h-4 w-4 shrink-0 accent-lime-500" />
              <span>
                I confirm the information is accurate and allow the store to review my business proof for this application. I understand retailer access is subject to approval; pricing, minimum orders, payment, delivery, and return terms will be agreed separately before ordering. I have read the{" "}
                <Link href="/terms" target="_blank" className="font-bold text-lime-800 underline">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" target="_blank" className="font-bold text-lime-800 underline">Privacy Policy</Link>.
              </span>
            </label>

            <p className="text-xs leading-5 text-slate-500">
              Submitting an application does not create a login or send an authentication email. The store will contact you using the email or phone above after review.
            </p>

            {notice && <p role="status" className="ui-feedback ui-feedback--success">{notice}</p>}
            {error && <p role="alert" className="ui-feedback ui-feedback--error">{error}</p>}

            <button
              disabled={busy}
              className="rounded-xl bg-brand-primary px-5 py-4 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {busy ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already approved? <Link href="/retailer/login" className="font-bold text-lime-700">Login here</Link>
        </p>
      </section>
    </main>
  );
}
