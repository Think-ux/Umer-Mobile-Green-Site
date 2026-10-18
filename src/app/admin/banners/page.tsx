"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useCatalog } from "@/components/CatalogProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Banner = {
  id: number;
  title: string;
  image_url: string;
  placement: string;
  link_url: string;
  status: "draft" | "published";
};

type BannerForm = Omit<Banner, "id" | "status"> & { status: Banner["status"] };

const emptyForm: BannerForm = {
  title: "",
  image_url: "",
  placement: "Homepage",
  link_url: "",
  status: "draft",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary";

export default function AdminBannersPage() {
  const { refresh } = useCatalog();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBanners = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Connect the database before managing banners.");
      return;
    }
    const { data, error: queryError } = await supabase
      .from("banners")
      .select("id,title,image_url,placement,link_url,status")
      .order("created_at", { ascending: false })
      .returns<Banner[]>();

    if (queryError) {
      setError(`Could not load banners: ${queryError.message}`);
    } else {
      setBanners(data);
      setError("");
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadBanners);
  }, [loadBanners]);

  async function saveBanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Banner changes have not been saved.");
      setBusy(false);
      return;
    }

    let imageUrl = form.image_url.trim();
    try {
      if (imageFile) {
        const extensions: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };
        if (!extensions[imageFile.type] || imageFile.size > 5 * 1024 * 1024) {
          throw new Error("Choose a JPG, PNG or WebP banner image smaller than 5 MB.");
        }
      } else {
        const image = new URL(imageUrl);
        if (image.protocol !== "https:") {
          throw new Error("Banner image URL must use HTTPS.");
        }
      }
      if (form.link_url.startsWith("//")) {
        throw new Error("Destination must be a local path or a full HTTPS URL.");
      }
      if (form.link_url && !form.link_url.startsWith("/")) {
        const destination = new URL(form.link_url);
        if (destination.protocol !== "https:") {
          throw new Error("Destination URL must use HTTPS.");
        }
      }
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Enter valid HTTPS URLs for the banner."
      );
      setBusy(false);
      return;
    }

    let uploadedPath: string | null = null;
    if (imageFile) {
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const extension = extensions[imageFile.type];
      uploadedPath = `banners/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uploadedPath, imageFile, {
          cacheControl: "3600",
          contentType: imageFile.type,
        });
      if (uploadError) {
        setError(`Banner image was not uploaded: ${uploadError.message}`);
        setBusy(false);
        return;
      }
      imageUrl = supabase.storage.from("product-images").getPublicUrl(uploadedPath).data.publicUrl;
    }

    const bannerData = { ...form, image_url: imageUrl };
    const result = editingId === null
      ? await supabase.from("banners").insert(bannerData)
      : await supabase.from("banners").update(bannerData).eq("id", editingId);
    if (result.error) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([uploadedPath]);
        setError(cleanupError
          ? `Banner was not saved (${result.error.message}); uploaded image cleanup also failed (${cleanupError.message}).`
          : `Banner was not saved: ${result.error.message}`);
      } else {
        setError(`Banner was not saved: ${result.error.message}`);
      }
      setBusy(false);
      return;
    }

    await loadBanners();
    await refresh();
    setNotice(editingId === null ? "Banner added." : "Banner updated.");
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
    setFormOpen(false);
    setBusy(false);
  }

  function editBanner(banner: Banner) {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      image_url: banner.image_url,
      placement: banner.placement,
      link_url: banner.link_url,
      status: banner.status,
    });
    setImageFile(null);
    setFormOpen(true);
    setError("");
    setNotice("");
  }

  async function deleteBanner(banner: Banner) {
    if (!window.confirm(`Delete "${banner.title}"?`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Banner was not deleted.");
      return;
    }
    const { error: deleteError } = await supabase
      .from("banners")
      .delete()
      .eq("id", banner.id);
    if (deleteError) {
      setError(`Banner was not deleted: ${deleteError.message}`);
      return;
    }
    await loadBanners();
    await refresh();
    setNotice("Banner deleted.");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-eyebrow-wide text-lime-700">
          Website management
        </p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Banners & campaigns</h1>
            <p className="mt-2 text-sm text-slate-500">
              Prepare promotional artwork, links and homepage placements.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm);
              setImageFile(null);
              setEditingId(null);
              setFormOpen(true);
              setError("");
              setNotice("");
            }}
            className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-black text-brand-primary-foreground hover:bg-brand-primary-hover"
          >
            + Create banner
          </button>
        </div>

        {error && <p role="alert" className="ui-feedback ui-feedback--error mt-5">{error}</p>}
        {notice && <p role="status" className="ui-feedback ui-feedback--success mt-5">{notice}</p>}

        {formOpen && (
          <form onSubmit={saveBanner} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black">{editingId === null ? "New campaign banner" : "Edit campaign banner"}</h2>
              <button type="button" onClick={() => setFormOpen(false)} className="text-sm font-bold text-slate-500">Cancel</button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Campaign title">
                <input required className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </Field>
              <Field label="Placement">
                <select className={inputClass} value={form.placement} onChange={(event) => setForm({ ...form, placement: event.target.value })}>
                  <option>Homepage</option>
                  <option>Category page</option>
                  <option>Retailer page</option>
                </select>
              </Field>
              <Field label="Image URL (optional if uploading)">
                <input type="url" className={inputClass} value={form.image_url} onChange={(event) => { setForm({ ...form, image_url: event.target.value }); setImageFile(null); }} />
              </Field>
              <Field label="Upload banner image (JPG, PNG, WebP · max 5 MB)">
                <input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(event) => { const file = event.target.files?.[0] ?? null; setImageFile(file); if (file) setForm((current) => ({ ...current, image_url: "" })); }} />
              </Field>
              <Field label="Destination URL">
                <input className={inputClass} value={form.link_url} onChange={(event) => setForm({ ...form, link_url: event.target.value })} />
              </Field>
              <Field label="Status">
                <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Banner["status"] })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>
            <button disabled={busy} className="mt-5 rounded-xl bg-brand-primary px-5 py-3 text-sm font-black text-brand-primary-foreground disabled:opacity-60">
              {busy ? "Saving…" : "Save banner"}
            </button>
          </form>
        )}

        {banners.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No campaigns yet. Add a banner to start building your promotion schedule.
          </div>
        ) : (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-200">
              {banners.map((banner) => (
                <article key={banner.id} className="grid gap-4 p-5 sm:grid-cols-admin-banner-row sm:items-center">
                  <img src={banner.image_url} alt="" className="h-20 w-full rounded-xl bg-slate-100 object-cover sm:w-28" />
                  <div>
                    <h2 className="font-black">{banner.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{banner.placement}</p>
                    <p className="mt-1 break-all text-xs text-slate-400">{banner.link_url || "No destination URL"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${banner.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{banner.status}</span>
                    <button type="button" onClick={() => editBanner(banner)} className="text-sm font-bold text-lime-700">Edit</button>
                    <button type="button" onClick={() => void deleteBanner(banner)} className="text-sm font-bold text-red-600">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-bold text-slate-700">{label}{children}</label>;
}
