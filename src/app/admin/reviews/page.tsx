"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import StarRatingDisplay from "@/components/StarRatingDisplay";

type Review = {
  id: number;
  product_id: number;
  reviewer_name: string;
  rating: number;
  review_text: string;
  is_demo: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  products: { name: string } | null;
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReviews = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. Connect the database before moderating reviews.");
      setLoading(false);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("reviews")
      .select("id,product_id,reviewer_name,rating,review_text,status,is_demo,created_at,products(name)")
      .order("created_at", { ascending: false })
      .returns<Review[]>();

    if (queryError) {
      setError(`Could not load reviews: ${queryError.message}`);
    } else {
      setReviews(data);
      setError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadReviews);
  }, [loadReviews]);

  async function updateStatus(review: Review, status: Review["status"]) {
    setBusyId(review.id);
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. No changes were saved.");
      setBusyId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("reviews")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", review.id);

    if (updateError) {
      setError(`Could not update review: ${updateError.message}`);
    } else {
      setNotice(`Review by ${review.reviewer_name} marked ${status}.`);
      await loadReviews();
    }
    setBusyId(null);
  }

  async function deleteReview(review: Review) {
    if (!window.confirm(`Delete the review by ${review.reviewer_name}?`)) return;

    setBusyId(review.id);
    setError("");
    setNotice("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase is not configured. The review was not deleted.");
      setBusyId(null);
      return;
    }

    const { error: deleteError } = await supabase.from("reviews").delete().eq("id", review.id);
    if (deleteError) {
      setError(`Could not delete review: ${deleteError.message}`);
    } else {
      setNotice("Review deleted.");
      await loadReviews();
    }
    setBusyId(null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-eyebrow-wide text-lime-700">Feedback</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Reviews</h1>
          <p className="mt-2 text-sm text-slate-500">Customer feedback submitted from product pages</p>
        </div>

        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        <div className="space-y-4">
          {loading ? (
            <p role="status" className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Loading reviews…</p>
          ) : reviews.length === 0 && !error ? (
            <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No customer reviews have been submitted yet.</p>
          ) : reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <StarRatingDisplay rating={review.rating} className="text-amber-500" />
                  {review.is_demo && (
                    <p className="mt-2 inline-flex rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-2xs font-black uppercase tracking-wide text-amber-900">
                      Demo — not customer feedback
                    </p>
                  )}
                  {review.review_text ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">“{review.review_text}”</p>
                  ) : (
                    <p className="mt-3 text-sm italic text-slate-500">Star rating only</p>
                  )}
                  <div className="mt-4 font-black text-slate-900">{review.reviewer_name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {review.products?.name ?? `Product #${review.product_id}`} · {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                    review.status === "approved" ? "bg-green-100 text-green-700" :
                      review.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>{review.status}</span>
                  {(["approved", "rejected", "pending"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={busyId === review.id || review.status === status}
                      onClick={() => void updateStatus(review, status)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold capitalize text-slate-700 hover:border-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyId === review.id ? "Saving…" : status}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => void deleteReview(review)}
                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
