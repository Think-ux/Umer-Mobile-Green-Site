"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/components/CatalogProvider";
import type { Product } from "@/data/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type ProductRow = Omit<Product, "oldPrice" | "retailerDiscountPercent"> & {
  old_price: number;
  retailer_discount_percent: number;
  is_published: boolean;
};

type ProductForm = {
  name: string;
  brand: string;
  model: string;
  category: string;
  quality: string;
  price: string;
  oldPrice: string;
  retailerDiscountPercent: string;
  stock: string;
  image: string;
  imageFile: File | null;
  published: boolean;
  featured: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  brand: "",
  model: "",
  category: "",
  quality: "Premium",
  price: "",
  oldPrice: "",
  retailerDiscountPercent: "0",
  stock: "0",
  image: "",
  imageFile: null,
  published: true,
  featured: false,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary";

function mapRow(row: ProductRow): Product & { is_published: boolean } {
  const { old_price, retailer_discount_percent, ...product } = row;
  return {
    ...product,
    oldPrice: Number(old_price),
    retailerDiscountPercent: Number(retailer_discount_percent),
  };
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminProducts() {
  const { categories, brands, refresh } = useCatalog();
  const [rows, setRows] = useState<(Product & { is_published: boolean })[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadProducts = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Connect the database before managing products.");
      return;
    }

    const { data, error: queryError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<ProductRow[]>();

    if (queryError) {
      setError(`Could not load products: ${queryError.message}`);
      return;
    }

    setRows(data.map(mapRow));
    setError("");
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadProducts);
  }, [loadProducts]);

  const brandOptions = [...new Set([
    ...brands.map((brand) => brand.name),
    ...rows.map((product) => product.brand),
  ])].sort((a, b) => a.localeCompare(b));
  const categoryOptions = [...new Set([
    ...categories.map((category) => category.name),
    ...rows.map((product) => product.category),
  ])].sort((a, b) => a.localeCompare(b));
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return rows.filter((product) =>
      (!query || `${product.name} ${product.brand} ${product.model} ${product.category} ${product.slug}`.toLocaleLowerCase().includes(query)) &&
      (!categoryFilter || product.category === categoryFilter) &&
      (!brandFilter || product.brand === brandFilter) &&
      (visibilityFilter === "all" || (visibilityFilter === "published" ? product.is_published : !product.is_published))
    );
  }, [brandFilter, categoryFilter, rows, search, visibilityFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visiblePage = Math.min(page, pageCount);
  const visibleProducts = filteredProducts.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);

  function changeField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function beginEdit(product: Product & { is_published: boolean }) {
    setEditingId(product.id);
    setFormOpen(true);
    setForm({
      name: product.name,
      brand: product.brand,
      model: product.model,
      category: product.category,
      quality: product.quality,
      price: String(product.price),
      oldPrice: String(product.oldPrice),
      retailerDiscountPercent: String(product.retailerDiscountPercent),
      stock: String(product.stock),
      image: product.image,
      imageFile: null,
      published: product.is_published,
      featured: product.is_featured === true,
    });
    setNotice("");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setFormOpen(false);
    setForm(emptyForm);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Product changes have not been saved.");
      setBusy(false);
      return;
    }

    const productData = {
      slug: createSlug(form.name),
      name: form.name.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      category: form.category,
      quality: form.quality.trim(),
      price: Number(form.price),
      old_price: Number(form.oldPrice || 0),
      retailer_discount_percent: Number(form.retailerDiscountPercent || 0),
      stock: Number(form.stock),
      image: "",
      is_published: form.published,
      is_featured: form.featured,
    };

    let imageUrl = form.image.trim();
    let uploadedPath: string | null = null;

    if (form.imageFile) {
      const file = form.imageFile;
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const extension = extensions[file.type];

      if (!extension || file.size > 5 * 1024 * 1024) {
        setError("Choose a JPG, PNG or WebP image smaller than 5 MB.");
        setBusy(false);
        return;
      }

      uploadedPath = `${productData.slug}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(uploadedPath, file, {
          cacheControl: "3600",
          contentType: file.type,
        });

      if (uploadError) {
        setError(`Product image was not uploaded: ${uploadError.message}`);
        setBusy(false);
        return;
      }
      imageUrl = supabase.storage.from("product-images").getPublicUrl(uploadedPath).data.publicUrl;
    } else if (imageUrl) {
      try {
        const url = new URL(imageUrl);
        const isUnsplash = url.protocol === "https:" && url.hostname === "images.unsplash.com";
        const isSupabaseImage =
          url.protocol === "https:" &&
          url.hostname.endsWith(".supabase.co") &&
          url.pathname.startsWith("/storage/v1/object/public/product-images/");
        if (!isUnsplash && !isSupabaseImage) {
          throw new Error("Use an Unsplash product image URL or upload an image.");
        }
      } catch (validationError) {
        setError(
          validationError instanceof Error
            ? validationError.message
            : "Enter a valid image URL."
        );
        setBusy(false);
        return;
      }
    } else {
      setError("Upload a product image or enter a supported image URL.");
      setBusy(false);
      return;
    }

    const result = editingId === null
      ? await supabase.from("products").insert({ ...productData, image: imageUrl })
      : await supabase.from("products").update({ ...productData, image: imageUrl }).eq("id", editingId);

    if (result.error) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("product-images")
          .remove([uploadedPath]);
        if (cleanupError) {
          setError(
            `Product was not saved (${result.error.message}); uploaded image cleanup also failed (${cleanupError.message}).`
          );
          setBusy(false);
          return;
        }
      }
      setError(`Product was not saved: ${result.error.message}`);
      setBusy(false);
      return;
    }

    await loadProducts();
    await refresh();
    setNotice(editingId === null ? "Product added successfully." : "Product updated successfully.");
    cancelEdit();
    setBusy(false);
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Product was not deleted.");
      return;
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      setError(`Product was not deleted: ${deleteError.message}`);
      return;
    }

    await loadProducts();
    await refresh();
    setNotice("Product deleted.");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-eyebrow-wide text-lime-700">Inventory</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Products</h1>
            <p className="mt-2 text-sm text-slate-500">Manage the shared storefront catalog.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormOpen(true);
              setForm(emptyForm);
              setError("");
              setNotice("");
            }}
            className="rounded-xl bg-brand-primary px-5 py-3 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover"
          >
            + Add Product
          </button>
        </div>

        <StatusMessage error={error} notice={notice} />

        {formOpen && (
          <form onSubmit={saveProduct} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-black">{editingId === null ? "Add product" : "Edit product"}</h2>
              <button type="button" onClick={cancelEdit} className="text-sm font-bold text-slate-500 hover:text-slate-900">
                Cancel
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Product name">
                <input required className={inputClass} value={form.name} onChange={(event) => changeField("name", event.target.value)} />
              </Field>
              <Field label="Brand">
                <select required className={inputClass} value={form.brand} onChange={(event) => changeField("brand", event.target.value)}>
                  <option value="">Choose brand</option>
                  {[...new Set([...brands.map((brand) => brand.name), ...rows.map((product) => product.brand)])]
                    .sort((a, b) => a.localeCompare(b))
                    .map((brand) => <option key={brand}>{brand}</option>)}
                </select>
              </Field>
              <Field label="Compatible model">
                <input required className={inputClass} value={form.model} onChange={(event) => changeField("model", event.target.value)} />
              </Field>
              <Field label="Category">
                <select required className={inputClass} value={form.category} onChange={(event) => changeField("category", event.target.value)}>
                  <option value="">Choose category</option>
                  {categories.map((category) => <option key={category.name}>{category.name}</option>)}
                </select>
              </Field>
              <Field label="Quality">
                <input required className={inputClass} value={form.quality} onChange={(event) => changeField("quality", event.target.value)} />
              </Field>
              <Field label="Price (PKR)">
                <input required min="0" step="0.01" type="number" className={inputClass} value={form.price} onChange={(event) => changeField("price", event.target.value)} />
              </Field>
              <Field label="Old price (optional)">
                <input min="0" step="0.01" type="number" className={inputClass} value={form.oldPrice} onChange={(event) => changeField("oldPrice", event.target.value)} />
              </Field>
              <Field label="Retailer discount (%)">
                <input required min="0" max="100" step="0.01" type="number" className={inputClass} value={form.retailerDiscountPercent} onChange={(event) => changeField("retailerDiscountPercent", event.target.value)} />
              </Field>
              <Field label="Stock quantity">
                <input required min="0" step="1" type="number" className={inputClass} value={form.stock} onChange={(event) => changeField("stock", event.target.value)} />
              </Field>
              <Field label="Image URL (optional if uploading)">
                <input type="url" className={inputClass} value={form.image} onChange={(event) => changeField("image", event.target.value)} />
              </Field>
              <Field label="Upload product image (JPG, PNG, WebP · max 5 MB)">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={inputClass}
                  onChange={(event) => changeField("imageFile", event.target.files?.[0] ?? null)}
                />
              </Field>
            </div>

            <label className="mt-5 flex items-center gap-3 text-sm font-bold">
              <input type="checkbox" checked={form.published} onChange={(event) => changeField("published", event.target.checked)} className="h-4 w-4 accent-lime-500" />
              Publish product to the storefront
            </label>
            <label className="mt-3 flex items-center gap-3 text-sm font-bold">
              <input type="checkbox" checked={form.featured} onChange={(event) => changeField("featured", event.target.checked)} className="h-4 w-4 accent-lime-500" />
              Include in homepage Featured Products section
            </label>

            <button disabled={busy} className="mt-5 rounded-xl bg-brand-primary px-6 py-3 font-black text-brand-primary-foreground transition hover:bg-brand-primary-hover disabled:opacity-60">
              {busy ? "Saving…" : editingId === null ? "Save product" : "Update product"}
            </button>
          </form>
        )}

        <section aria-label="Filter products" className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold text-slate-600">
            Search products
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Name, brand, model or slug"
              className={inputClass}
            />
          </label>
          <label className="text-xs font-bold text-slate-600">
            Category
            <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">All categories</option>
              {categoryOptions.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Brand
            <select value={brandFilter} onChange={(event) => { setBrandFilter(event.target.value); setPage(1); }} className={inputClass}>
              <option value="">All brands</option>
              {brandOptions.map((brand) => <option key={brand}>{brand}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Publication
            <select value={visibilityFilter} onChange={(event) => { setVisibilityFilter(event.target.value as typeof visibilityFilter); setPage(1); }} className={inputClass}>
              <option value="all">All products</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </label>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-black">Catalog products</h2>
            <span className="text-sm text-slate-500">{filteredProducts.length} of {rows.length} products</span>
          </div>
          {rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Products will appear here after the Supabase schema is installed and connected.
            </p>
          ) : filteredProducts.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No products match these filters. Try changing or clearing your search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-order-table text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Retailer discount</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Visibility</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-5 py-4">
                        <p className="font-black">{product.name}{product.is_featured ? <span className="ml-2 text-xs font-bold text-lime-700">Featured</span> : null}</p>
                        <p className="mt-1 text-xs text-slate-500">{product.brand} · {product.model}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{product.category}</td>
                      <td className="px-5 py-4 font-bold">Rs. {product.price.toLocaleString("en-PK")}</td>
                      <td className="px-5 py-4 text-slate-600">{product.retailerDiscountPercent}%</td>
                      <td className="px-5 py-4">{product.stock}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${product.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {product.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="space-x-3 px-5 py-4 text-right">
                        <button type="button" onClick={() => beginEdit(product)} className="font-bold text-lime-700 hover:text-lime-800">Edit</button>
                        <button type="button" onClick={() => void deleteProduct(product)} className="font-bold text-red-600 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredProducts.length > 0 && (
            <nav aria-label="Product pages" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
              <p className="text-sm text-slate-500">Page {visiblePage} of {pageCount}</p>
              <div className="flex gap-2">
                <button type="button" disabled={visiblePage <= 1} onClick={() => setPage(visiblePage - 1)} className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                <button type="button" disabled={visiblePage >= pageCount} onClick={() => setPage(visiblePage + 1)} className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50">Next</button>
              </div>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-bold text-slate-700">{label}{children}</label>;
}

function StatusMessage({ error, notice }: { error: string; notice: string }) {
  if (error) {
    return <p role="alert" className="ui-feedback ui-feedback--error mt-5">{error}</p>;
  }
  if (notice) {
    return <p role="status" className="ui-feedback ui-feedback--success mt-5">{notice}</p>;
  }
  return null;
}
