const categories = ["Displays", "Batteries", "Charging Parts", "Camera Parts", "Housing", "Flex", "Speakers", "Connectors"];

export default function AdminCategories() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:ml-64">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-black">Categories</h1>
            <p className="text-sm text-slate-500">Catalogue organization</p>
          </div>
          <button className="rounded-xl bg-orange-500 px-5 py-3 font-black text-white">+ Add Category</button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((x, i) => (
            <div key={x} className="rounded-2xl border bg-slate-50 p-5">
              <div className="text-2xl font-black text-orange-500">0{i + 1}</div>
              <div className="mt-3 font-black">{x}</div>
              <div className="mt-1 text-xs text-slate-400">{40 + i * 12} products</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
