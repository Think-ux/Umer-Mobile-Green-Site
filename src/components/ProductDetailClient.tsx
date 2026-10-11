"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { categorySlug, type Product } from "@/data/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  product: Product;
};

type ProductReview = {
  id: number;
  reviewer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
};

export default function ProductDetailClient({ product }: Props) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");

  const inStock = product.stock > 0;
  const maxQuantity = Math.max(1, product.stock);
  const discounted = product.oldPrice > product.price && product.oldPrice > 0;
  const discount = discounted
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const formatPrice = (price: number) =>
    `Rs. ${price.toLocaleString("en-PK")}`;

  function handleAdd() {
    if (!inStock) return;
    addToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  const loadReviews = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReviewError("Reviews are unavailable because Supabase is not configured.");
      return;
    }
    const { data, error: queryError } = await supabase
      .from("reviews")
      .select("id,reviewer_name,rating,review_text,created_at")
      .eq("product_id", product.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .returns<ProductReview[]>();

    if (queryError) {
      setReviewError(`Could not load reviews: ${queryError.message}`);
      return;
    }
    setReviews(data);
    setReviewError("");
  }, [product.id]);

  useEffect(() => {
    void Promise.resolve().then(loadReviews);
  }, [loadReviews]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewBusy(true);
    setReviewError("");
    setReviewNotice("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReviewError("Supabase is not configured. Your review has not been submitted.");
      setReviewBusy(false);
      return;
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      product_id: product.id,
      reviewer_name: reviewerName.trim(),
      rating: reviewRating,
      review_text: reviewText.trim(),
      status: "pending",
    });

    if (insertError) {
      setReviewError(`Could not submit your review: ${insertError.message}`);
    } else {
      setReviewerName("");
      setReviewText("");
      setReviewRating(5);
      setReviewNotice("Thanks for your feedback. Your review will appear after moderation.");
    }
    setReviewBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="transition hover:text-orange-600">Home</Link>
          <span>/</span>
          <Link href="/search" className="transition hover:text-orange-600">Shop</Link>
          <span>/</span>
          <Link href={`/shop/${categorySlug(product.category)}`} className="transition hover:text-orange-600">
            {product.category}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">{product.name}</span>
        </nav>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <section>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
              <div className="absolute left-5 top-5 z-10 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                  {product.quality} Quality
                </span>
                {discounted && (
                  <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">
                    Save {discount}%
                  </span>
                )}
              </div>

              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain p-5 transition duration-500 hover:scale-105 sm:p-10"
                />
              </div>

              <div className="absolute bottom-5 right-5 rounded-xl border border-slate-100 bg-white/95 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
                SKU: {product.id}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: "✓", title: "Quality", text: "Grade shown" },
                { icon: "◇", title: "Compatibility", text: product.model },
                { icon: "↗", title: "Ordering", text: "Easy checkout" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200/80 bg-white p-3 text-center sm:p-4">
                  <span className="text-xl font-black text-orange-500">{item.icon}</span>
                  <p className="mt-1 text-xs font-extrabold sm:text-sm">{item.title}</p>
                  <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-xs">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8 lg:p-9">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
              Umer Mobile Parts · {product.brand}
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-amber-500">
                ★ {product.rating}
              </span>
              <span className="text-sm text-slate-400">|</span>
              <span className="text-sm text-slate-600">Model: {product.model}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                inStock ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {inStock ? "● In Stock" : "● Sold Out"}
              </span>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-black tracking-tight sm:text-4xl">
                  {formatPrice(product.price)}
                </span>
                {discounted && (
                  <span className="pb-1 text-sm text-slate-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              {discounted && (
                <p className="mt-2 text-sm font-bold text-emerald-700">
                  You save {formatPrice(product.oldPrice - product.price)} ({discount}% off)
                </p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Prices are displayed in Pakistani Rupees.
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-base font-extrabold">Product information</h2>
              <dl className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">
                {[
                  ["Brand", product.brand],
                  ["Compatible model", product.model],
                  ["Category", product.category],
                  ["Quality grade", product.quality],
                  ["Availability", inStock ? `${product.stock} units available` : "Out of stock"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="text-right text-sm font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6">
              <label htmlFor="product-quantity" className="mb-3 block text-sm font-extrabold">
                Quantity
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex h-12 w-fit items-center rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={!inStock || quantity <= 1}
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="h-full w-11 rounded-l-xl text-xl font-bold hover:bg-slate-50 disabled:opacity-40"
                  >
                    −
                  </button>
                  <input
                    id="product-quantity"
                    aria-label="Product quantity"
                    type="number"
                    min={1}
                    max={maxQuantity}
                    disabled={!inStock}
                    value={quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value)) {
                        setQuantity(Math.min(maxQuantity, Math.max(1, Math.floor(value || 1))));
                      }
                    }}
                    className="h-full w-14 border-x border-slate-200 text-center font-bold outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={!inStock || quantity >= maxQuantity}
                    onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                    className="h-full w-11 rounded-r-xl text-xl font-bold hover:bg-slate-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!inStock}
                  className="min-h-12 flex-1 rounded-xl bg-orange-500 px-5 py-3 font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {!inStock ? "Currently Unavailable" : added ? "✓ Added to Cart" : "Add to Cart →"}
                </button>
              </div>

              {added && (
                <p role="status" aria-live="polite" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                  Product added to your cart successfully.
                </p>
              )}

              <Link href="/cart" className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700">
                View Shopping Cart
              </Link>
            </div>

            <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              <h2 className="text-sm font-extrabold">Need help choosing the right part?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Confirm your exact mobile model and part compatibility before ordering.
              </p>
              <Link href="/customer-care" className="mt-2 inline-flex text-sm font-bold text-orange-700 hover:text-orange-800">
                Contact Customer Support →
              </Link>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="text-sm font-extrabold">Delivery, warranty and returns</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Delivery estimates and warranty or return terms must be confirmed with the store before ordering.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-orange-700">
                <Link href="/shipping-policy" className="hover:text-orange-800">Shipping details</Link>
                <Link href="/returns-policy" className="hover:text-orange-800">Returns &amp; warranty</Link>
                <Link href="/customer-care" className="hover:text-orange-800">Contact support</Link>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 grid gap-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Customer feedback</p>
            <h2 className="mt-2 text-2xl font-black">Reviews for {product.name}</h2>
            {reviewError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{reviewError}</p>}
            <div className="mt-5 space-y-4">
              {reviews.length === 0 && !reviewError ? (
                <p className="text-sm text-slate-500">No approved reviews yet. Be the first to share your experience.</p>
              ) : reviews.map((review) => (
                <article key={review.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{review.review_text}</p>
                  <p className="mt-3 text-sm font-bold text-slate-900">{review.reviewer_name}</p>
                </article>
              ))}
            </div>
          </div>
          <form onSubmit={submitReview} className="space-y-4 rounded-2xl bg-slate-50 p-5">
            <h3 className="font-black">Write a review</h3>
            <label className="block text-sm font-bold text-slate-700">
              Your name
              <input required maxLength={120} value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Rating
              <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3">
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Your review
              <textarea required minLength={3} maxLength={2000} value={reviewText} onChange={(event) => setReviewText(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3" />
            </label>
            {reviewError && <p role="alert" className="text-sm text-red-700">{reviewError}</p>}
            {reviewNotice && <p role="status" className="text-sm text-emerald-700">{reviewNotice}</p>}
            <button disabled={reviewBusy} className="w-full rounded-xl bg-orange-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">
              {reviewBusy ? "Submitting…" : "Submit review"}
            </button>
          </form>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Shop with confidence</p>
          <h2 className="mt-2 text-2xl font-black">Before you place your order</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <h3 className="font-extrabold">Check compatibility</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Verify your exact phone model before buying a replacement part.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <h3 className="font-extrabold">Review quantity</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Choose the required quantity and review your cart before checkout.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <h3 className="font-extrabold">Get assistance</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">Contact customer support if you need help identifying the right part.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
