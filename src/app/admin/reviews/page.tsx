const reviews = [
  ["Muhammad Ali", "iPhone 13 LCD Premium", "?????", "Excellent quality and fast delivery."],
  ["Ahmed Mobile Store", "Samsung A15 LCD", "?????", "Good quality. Perfect for our customers."],
  ["Hassan", "iPhone 11 Battery", "?????", "Works well and packaging was good."]
];

export default function AdminReviews() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:ml-64">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-black">Reviews</h1>
        <p className="text-sm text-slate-500">Customer feedback and moderation</p>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {reviews.map(x => (
            <div key={x[0]} className="rounded-2xl border bg-slate-50 p-5">
              <div className="text-amber-500">{x[2]}</div>
              <p className="mt-4 text-sm leading-6 text-slate-600">“{x[3]}”</p>
              <div className="mt-5 border-t pt-4">
                <div className="font-black">{x[0]}</div>
                <div className="text-xs text-slate-400">{x[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
