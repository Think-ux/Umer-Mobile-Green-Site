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
      <section className="mx-auto max-w-2xl px-4 py-14">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-orange-500">Retailer Application</p>
          <h1 className="mt-2 text-4xl font-black">Become a Umer retailer</h1>
          <p className="mt-3 text-slate-500">Share your business and contact details so the team can review your application. Wholesale terms will be discussed separately.</p>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={submitApplication} className="grid gap-5">
            <label className="text-sm font-bold text-slate-700">
              Owner full name
              <input name="owner_name" required maxLength={120} autoComplete="name" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Business contact email
              <input name="email" required type="email" maxLength={254} autoComplete="email" className="mt-2 w-full rounded-xl border p-4" />
              <span className="mt-1 block text-xs font-normal text-slate-500">Use the email you want associated with retailer account setup. Submitting this form does not create or sign in to an account.</span>
            </label>
            <label className="text-sm font-bold text-slate-700">
              Shop / business name
              <input name="business_name" required maxLength={160} autoComplete="organization" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Type of business
              <select name="business_type" required defaultValue="" className="mt-2 w-full rounded-xl border bg-white p-4">
                <option value="" disabled>Select your business type</option>
                <option value="repair_shop">Mobile repair shop</option>
                <option value="mobile_parts_retailer">Mobile parts retailer / wholesaler</option>
                <option value="online_seller">Online seller</option>
                <option value="other">Other related business</option>
              </select>
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
              What parts or products are you interested in?
              <textarea name="business_details" maxLength={2000} placeholder="For example: screens, batteries, charging parts, brands/models, or the products you usually source." className="mt-2 min-h-32 w-full rounded-xl border p-4" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Shop/business proof document (required · PDF, JPG or PNG · max 10 MB)
              <input required name="required_document" type="file" accept="application/pdf,image/jpeg,image/png" className="mt-2 w-full rounded-xl border p-4" />
            </label>
            <label className="flex items-start gap-3 text-sm font-normal leading-6 text-slate-600">
              <input required name="terms_accepted" type="checkbox" value="true" className="mt-1 h-4 w-4 shrink-0 accent-orange-500" />
              <span>
                I confirm the information is accurate and allow the store to review my business proof for this application. I understand retailer access is subject to approval; pricing, minimum orders, payment, delivery, and return terms will be agreed separately before ordering. I have read the{" "}
                <Link href="/terms" target="_blank" className="font-bold text-orange-700 underline">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy-policy" target="_blank" className="font-bold text-orange-700 underline">Privacy Policy</Link>.
              </span>
            </label>
            <p className="text-xs leading-5 text-slate-500">Submitting an application does not create a login or send an authentication email. The store will contact you using the email or phone above after review.</p>
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
