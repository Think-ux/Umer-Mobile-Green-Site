"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useCatalog, type StoreBrand } from "@/components/CatalogProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type BrandRow = StoreBrand & { is_enabled: boolean };

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary";

export default function AdminBrandsPage() {
  const { refresh } = useCatalog();
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBrands = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Connect the database before managing brands.");
      return;
    }
    const { data, error: queryError } = await supabase
      .from("brands")
      .select("id,name,sort_order,is_enabled")
      .order("sort_order")
      .returns<BrandRow[]>();
    if (queryError) {
      setError(`Could not load brands: ${queryError.message}`);
      return;
    }
    setBrands(data);
    setError("");
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadBrands);
  }, [loadBrands]);

  async function addBrand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Enter a brand name.");
      setBusy(false);
      return;
    }
    if (brands.some((brand) => brand.name.toLowerCase() === normalizedName.toLowerCase())) {
      setError("That brand already exists.");
      setBusy(false);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Brand was not saved.");
      setBusy(false);
      return;
    }
    const { error: insertError } = await supabase.from("brands").insert({
      name: normalizedName,
      sort_order: brands.length + 1,
    });
    if (insertError) {
      setError(`Brand was not saved: ${insertError.message}`);
      setBusy(false);
      return;
    }
    setName("");
    await loadBrands();
    await refresh();
    setNotice(`${normalizedName} added to the storefront brand list.`);
    setBusy(false);
  }

  async function toggleBrand(brand: BrandRow) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Brand visibility was not changed.");
      return;
    }
    const { error: updateError } = await supabase
      .from("brands")
      .update({ is_enabled: !brand.is_enabled })
      .eq("id", brand.id);
    if (updateError) {
      setError(`Brand visibility was not changed: ${updateError.message}`);
      return;
    }
    await loadBrands();
    await refresh();
    setNotice(`${brand.name} is now ${brand.is_enabled ? "hidden" : "visible"}.`);
  }

  async function deleteBrand(brand: BrandRow) {
    if (!window.confirm(`Delete "${brand.name}" from the brand list? Existing products are unchanged.`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Brand was not deleted.");
      return;
    }
    const { error: deleteError } = await supabase.from("brands").delete().eq("id", brand.id);
    if (deleteError) {
      setError(`Brand was not deleted: ${deleteError.message}`);
      return;
    }
    await loadBrands();
    await refresh();
    setNotice(`${brand.name} removed from the brand list.`);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">Catalog</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Brands</h1>
        <p className="mt-2 text-sm text-slate-500">Manage brands displayed in the storefront’s Shop by Brand section.</p>
        {error && <p role="alert" className="ui-feedback ui-feedback--error mt-5">{error}</p>}
        {notice && <p role="status" className="ui-feedback ui-feedback--success mt-5">{notice}</p>}
        <form onSubmit={addBrand} className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-bold text-slate-700">
            Brand name
            <input required maxLength={100} placeholder="e.g. Apple" className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <button disabled={busy} className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-black text-brand-primary-foreground disabled:opacity-60">
            {busy ? "Saving…" : "Add brand"}
          </button>
        </form>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {brands.map((brand) => (
            <article key={brand.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <h2 className="font-black">{brand.name}</h2>
                <p className={`mt-1 text-xs font-bold ${brand.is_enabled ? "text-emerald-700" : "text-slate-500"}`}>
                  {brand.is_enabled ? "Visible on storefront" : "Hidden from storefront"}
                </p>
              </div>
              <div className="flex gap-3 text-sm font-bold">
                <button type="button" onClick={() => void toggleBrand(brand)} className="text-lime-700">
                  {brand.is_enabled ? "Hide" : "Show"}
                </button>
                <button type="button" onClick={() => void deleteBrand(brand)} className="text-red-600">Delete</button>
              </div>
            </article>
          ))}
          {brands.length === 0 && !error && (
            <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No brands added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
