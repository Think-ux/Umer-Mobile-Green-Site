"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCatalog } from "@/components/CatalogProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Settings = {
  store: {
    name: string;
    support_email: string;
    phone: string;
    whatsapp: string;
    contact_verified: boolean;
  };
  delivery: {
    charge: string;
    free_threshold: string;
    estimated_time: string;
    details_verified: boolean;
  };
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
};

const initialSettings: Settings = {
  store: {
    name: "Umer Mobile Parts",
    support_email: "",
    phone: "",
    whatsapp: "",
    contact_verified: false,
  },
  delivery: {
    charge: "",
    free_threshold: "",
    estimated_time: "",
    details_verified: false,
  },
  social: { instagram: "", facebook: "", tiktok: "" },
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500";

export default function AdminSettingsPage() {
  const { refresh } = useCatalog();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase is not configured. Site settings cannot be loaded.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("site_settings")
        .select("setting_key,setting_value")
        .returns<{ setting_key: string; setting_value: Record<string, unknown> }[]>();

      if (!active) return;
      if (queryError) {
        setError(`Could not load site settings: ${queryError.message}`);
      } else if (data) {
        const next: Settings = { ...initialSettings };
        for (const row of data) {
          if (row.setting_key === "store") {
            next.store = {
              ...next.store,
              name: settingText(row.setting_value.name, next.store.name),
              support_email: settingText(row.setting_value.support_email),
              phone: settingText(row.setting_value.phone),
              whatsapp: settingText(row.setting_value.whatsapp),
              contact_verified: row.setting_value.contact_verified === true,
            };
          } else if (row.setting_key === "delivery") {
            next.delivery = {
              ...next.delivery,
              charge: settingText(row.setting_value.charge),
              free_threshold: settingText(row.setting_value.free_threshold),
              estimated_time: settingText(row.setting_value.estimated_time),
              details_verified: row.setting_value.details_verified === true,
            };
          } else if (row.setting_key === "social") {
            next.social = { ...next.social, ...row.setting_value };
          }
        }
        setSettings(next);
      }
      setLoading(false);
    }

    void loadSettings();
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof Settings>(
    group: K,
    field: keyof Settings[K],
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [group]: { ...current[group], [field]: value },
    }));
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const charge = settings.delivery.charge.trim();
    const freeThreshold = settings.delivery.free_threshold.trim();
    if (
      (charge === "") !== (freeThreshold === "") ||
      (charge !== "" &&
        (!Number.isFinite(Number(charge)) ||
          Number(charge) < 0 ||
          !Number.isFinite(Number(freeThreshold)) ||
          Number(freeThreshold) < 0))
    ) {
      setError("Enter both delivery amounts as valid non-negative numbers, or leave both blank.");
      setBusy(false);
      return;
    }
    if (
      settings.delivery.details_verified &&
      (charge === "" || settings.delivery.estimated_time.trim() === "")
    ) {
      setError("Enter the confirmed delivery charge, free-delivery threshold and estimate before marking delivery details verified.");
      setBusy(false);
      return;
    }
    if (
      settings.store.contact_verified &&
      (!settings.store.phone.trim() ||
        !settings.store.whatsapp.trim() ||
        !settings.store.support_email.trim())
    ) {
      setError("Add the confirmed mobile number, WhatsApp number and support email before verifying contact details.");
      setBusy(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Settings have not been saved.");
      setBusy(false);
      return;
    }

    const rows = Object.entries(settings).map(([setting_key, setting_value]) => ({
      setting_key,
      setting_value,
      updated_at: new Date().toISOString(),
    }));
    const { error: saveError } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "setting_key" });

    if (saveError) {
      setError(`Settings were not saved: ${saveError.message}`);
    } else {
      await refresh();
      setNotice("Site settings saved to the shared database.");
    }
    setBusy(false);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
          Website management
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Site settings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Store contact details, delivery terms and social links centrally.
        </p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}

        <form onSubmit={saveSettings} className="mt-6 space-y-5">
          <SettingsGroup title="Store identity" description="Contact details are hidden from customers until you verify them below.">
            <Field label="Store name">
              <input className={inputClass} value={settings.store.name} onChange={(event) => update("store", "name", event.target.value)} />
            </Field>
            <Field label="Support email">
              <input type="email" className={inputClass} value={settings.store.support_email} onChange={(event) => update("store", "support_email", event.target.value)} />
            </Field>
            <Field label="Phone number">
              <input type="tel" className={inputClass} value={settings.store.phone} onChange={(event) => update("store", "phone", event.target.value)} />
            </Field>
            <Field label="WhatsApp number">
              <input className={inputClass} value={settings.store.whatsapp} onChange={(event) => update("store", "whatsapp", event.target.value)} />
            </Field>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={settings.store.contact_verified}
                onChange={(event) => setSettings((current) => ({
                  ...current,
                  store: { ...current.store, contact_verified: event.target.checked },
                }))}
                className="h-4 w-4 accent-orange-500"
              />
              I have verified these customer-facing contact details.
            </label>
          </SettingsGroup>

          <SettingsGroup title="Delivery information" description="Delivery charges and estimates remain hidden until confirmed and verified below.">
            <Field label="Delivery charge (PKR)">
              <input min="0" type="number" className={inputClass} value={settings.delivery.charge} onChange={(event) => update("delivery", "charge", event.target.value)} />
            </Field>
            <Field label="Free delivery threshold (PKR)">
              <input min="0" type="number" className={inputClass} value={settings.delivery.free_threshold} onChange={(event) => update("delivery", "free_threshold", event.target.value)} />
            </Field>
            <Field label="Estimated delivery">
              <input className={inputClass} value={settings.delivery.estimated_time} onChange={(event) => update("delivery", "estimated_time", event.target.value)} />
            </Field>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={settings.delivery.details_verified}
                onChange={(event) => setSettings((current) => ({
                  ...current,
                  delivery: { ...current.delivery, details_verified: event.target.checked },
                }))}
                className="h-4 w-4 accent-orange-500"
              />
              I have confirmed these delivery terms with the business.
            </label>
          </SettingsGroup>

          <SettingsGroup title="Social links" description="Public links used across the storefront.">
            <Field label="Instagram URL">
              <input type="url" className={inputClass} value={settings.social.instagram} onChange={(event) => update("social", "instagram", event.target.value)} />
            </Field>
            <Field label="Facebook URL">
              <input type="url" className={inputClass} value={settings.social.facebook} onChange={(event) => update("social", "facebook", event.target.value)} />
            </Field>
            <Field label="TikTok URL">
              <input type="url" className={inputClass} value={settings.social.tiktok} onChange={(event) => update("social", "tiktok", event.target.value)} />
            </Field>
          </SettingsGroup>

          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">Updates are stored in the shared Supabase project.</p>
            <button disabled={loading || busy} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300">
              {loading ? "Loading…" : busy ? "Saving…" : "Save settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function settingText(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
}

function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-black">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-bold text-slate-700">{label}{children}</label>;
}
