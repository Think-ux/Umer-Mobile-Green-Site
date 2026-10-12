"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useCatalog, type StoreCategory } from "@/components/CatalogProvider";
import { categorySlug } from "@/data/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type CategoryRow = StoreCategory & {
  id: number;
  sort_order: number;
  is_enabled: boolean;
  icon_image_url?: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500";

export default function AdminCategories() {
  const { refresh } = useCatalog();
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("▣");
  const [iconImageUrl, setIconImageUrl] = useState("");
  const [iconImageFile, setIconImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  const loadCategories = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Connect the database before managing categories.");
      return;
    }
    const { data, error: queryError } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .returns<CategoryRow[]>();

    if (queryError) {
      setError(`Could not load categories: ${queryError.message}`);
    } else {
      setRows(data);
      setError("");
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadCategories);
  }, [loadCategories]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setIcon("▣");
    setIconImageUrl("");
    setIconImageFile(null);
    setFormOpen(false);
  }

  function editCategory(category: CategoryRow) {
    setEditingId(category.id);
    setName(category.name);
    setIcon(category.icon);
    setIconImageUrl(category.icon_image_url ?? "");
    setIconImageFile(null);
    setFormOpen(true);
    setNotice("");
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const normalizedName = name.trim();
    if (!categorySlug(normalizedName)) {
      setError("Use a category name that includes at least one letter or number so it can have a storefront URL.");
      setBusy(false);
      return;
    }
    const duplicatePath = rows.some(
      (row) =>
        row.id !== editingId &&
        categorySlug(row.name) === categorySlug(normalizedName)
    );
    if (duplicatePath) {
      setError("Another category already uses this URL path. Choose a different category name.");
      setBusy(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Category changes have not been saved.");
      setBusy(false);
      return;
    }

    const category = {
      name: normalizedName,
      icon: icon.trim() || "▣",
      updated_at: new Date().toISOString(),
    };
    let imageUrl = iconImageUrl.trim();
    let uploadedPath: string | null = null;

    if (iconImageFile) {
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const extension = extensions[iconImageFile.type];

      if (!extension || iconImageFile.size > 5 * 1024 * 1024) {
        setError("Choose a JPG, PNG or WebP icon smaller than 5 MB.");
        setBusy(false);
        return;
      }

      uploadedPath = `category-icons/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uploadedPath, iconImageFile, {
          cacheControl: "3600",
          contentType: iconImageFile.type,
        });

      if (uploadError) {
        setError(`Category icon was not uploaded: ${uploadError.message}`);
        setBusy(false);
        return;
      }
      imageUrl = supabase.storage
        .from("product-images")
        .getPublicUrl(uploadedPath).data.publicUrl;
    } else if (imageUrl) {
      try {
        const url = new URL(imageUrl);
        if (url.protocol !== "https:") {
          throw new Error("Icon image URL must use HTTPS.");
        }
      } catch (validationError) {
        setError(
          validationError instanceof Error
            ? validationError.message
            : "Enter a valid HTTPS icon image URL."
        );
        setBusy(false);
        return;
      }
    }

    const payload = { ...category, icon_image_url: imageUrl };
    let result = editingId === null
      ? await supabase.from("categories").insert({
          ...payload,
          sort_order: rows.length + 1,
        })
      : await supabase.from("categories").update(payload).eq("id", editingId);

    const iconColumnMissing =
      result.error?.message.includes("icon_image_url") === true &&
      (result.error.message.includes("schema cache") ||
        result.error.message.includes("does not exist"));
    if (iconColumnMissing) {
      result = editingId === null
        ? await supabase.from("categories").insert({
            ...category,
            sort_order: rows.length + 1,
          })
        : await supabase.from("categories").update(category).eq("id", editingId);
      if (!result.error) {
        if (uploadedPath) {
          const { error: cleanupError } = await supabase.storage
            .from("product-images")
            .remove([uploadedPath]);
          if (cleanupError) {
            setError(`Category saved, but uploaded icon cleanup failed: ${cleanupError.message}`);
            setBusy(false);
            return;
          }
        }
        await loadCategories();
        await refresh();
        setNotice("Category saved. Apply the latest Supabase schema to enable category image icons.");
        resetForm();
        setBusy(false);
        return;
      }
    }

    if (result.error) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([uploadedPath]);
        setError(cleanupError
          ? `Category was not saved (${result.error.message}); uploaded icon cleanup also failed (${cleanupError.message}).`
          : `Category was not saved: ${result.error.message}`);
      } else {
        setError(`Category was not saved: ${result.error.message}`);
      }
      setBusy(false);
      return;
    }

    await loadCategories();
    await refresh();
    setNotice(editingId === null ? "Category added." : "Category updated.");
    resetForm();
    setBusy(false);
  }

  async function toggleVisibility(category: CategoryRow) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Category visibility was not changed.");
      return;
    }
    const { error: updateError } = await supabase
      .from("categories")
      .update({
        is_enabled: !category.is_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", category.id);

    if (updateError) {
      setError(`Category visibility was not changed: ${updateError.message}`);
      return;
    }
    await loadCategories();
    await refresh();
    setNotice(`${category.name} is now ${category.is_enabled ? "hidden" : "visible"}.`);
  }

  async function moveCategory(category: CategoryRow, direction: -1 | 1) {
    setReorderingId(category.id);
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Category order was not changed.");
      setReorderingId(null);
      return;
    }
    const { error: moveError } = await supabase.rpc("move_category", {
      p_category_id: category.id,
      p_direction: direction,
    });
    if (moveError) {
      setError(`Could not move ${category.name}: ${moveError.message}. Apply the latest Supabase schema if category ordering is not installed.`);
      setReorderingId(null);
      return;
    }
    await loadCategories();
    await refresh();
    setNotice(`${category.name} moved ${direction < 0 ? "up" : "down"}.`);
    setReorderingId(null);
  }

  async function deleteCategory(category: CategoryRow) {
    if (!window.confirm(`Delete "${category.name}"? Categories with products cannot be deleted.`)) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Category was not deleted.");
      return;
    }
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (deleteError) {
      setError(`Category was not deleted: ${deleteError.message}`);
      return;
    }
    await loadCategories();
    await refresh();
    setNotice("Category deleted.");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-500">Catalog</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Categories</h1>
            <p className="mt-2 text-sm text-slate-500">Visible categories appear on the homepage and navigation. Published products are linked beneath their category.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setFormOpen(true);
              setError("");
              setNotice("");
            }}
            className="rounded-xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600"
          >
            + Add Category
          </button>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}

        {formOpen && (
          <form onSubmit={saveCategory} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-[1fr_120px_auto_auto] lg:items-end">
            <label className="text-sm font-bold">
              Category name
              <input required className={`${inputClass} min-h-14 text-lg font-semibold placeholder:text-slate-400`} placeholder="e.g. Charging Parts" value={name} onChange={(event) => setName(event.target.value)} />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Storefront path: /shop/{categorySlug(name || "category")}
              </span>
            </label>
            <label className="text-sm font-bold">
              Icon
              <input className={inputClass} value={icon} onChange={(event) => setIcon(event.target.value)} />
            </label>
            <label className="text-sm font-bold">
              Icon image URL (optional)
              <input
                type="url"
                className={inputClass}
                placeholder="https://…"
                value={iconImageUrl}
                onChange={(event) => {
                  setIconImageUrl(event.target.value);
                  setIconImageFile(null);
                }}
              />
            </label>
            <label className="text-sm font-bold">
              Upload icon (JPG, PNG, WebP · max 5 MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={inputClass}
                onChange={(event) => {
                  setIconImageFile(event.target.files?.[0] ?? null);
                  if (event.target.files?.[0]) setIconImageUrl("");
                }}
              />
            </label>
            {iconImageUrl && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 sm:col-span-2 lg:col-span-4">
                <img src={iconImageUrl} alt="Category icon preview" className="h-12 w-12 rounded-lg object-cover" />
                <p className="text-xs text-slate-500">This image appears on the storefront category card.</p>
              </div>
            )}
            <button disabled={busy} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
              {busy ? "Saving…" : editingId === null ? "Save" : "Update"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold">
              Cancel
            </button>
          </form>
        )}

        {rows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Categories will appear after the Supabase schema is installed and connected.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((category, index) => (
              <article key={category.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-orange-50 text-2xl text-orange-600">
                    {category.icon_image_url ? (
                      <img src={category.icon_image_url} alt="" className="h-full w-full object-cover" />
                    ) : category.icon}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    /shop/{categorySlug(category.name)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${category.is_enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {category.is_enabled ? "Visible" : "Hidden"}
                  </span>
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-wider text-slate-400">Category {String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-1 text-lg font-black">{category.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {category.count} published {category.count === 1 ? "product" : "products"}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-sm font-bold">
                  <span className="mr-auto text-xs font-semibold text-slate-500">Sort order {category.sort_order}</span>
                  <button type="button" aria-label={`Move ${category.name} up`} disabled={index === 0 || reorderingId !== null} onClick={() => void moveCategory(category, -1)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">↑</button>
                  <button type="button" aria-label={`Move ${category.name} down`} disabled={index === rows.length - 1 || reorderingId !== null} onClick={() => void moveCategory(category, 1)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">↓</button>
                  <button type="button" onClick={() => editCategory(category)} className="text-orange-600">Edit</button>
                  <button type="button" onClick={() => void toggleVisibility(category)} className="text-slate-600">
                    {category.is_enabled ? "Hide" : "Show"}
                  </button>
                  <button type="button" onClick={() => void deleteCategory(category)} className="text-red-600">Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
