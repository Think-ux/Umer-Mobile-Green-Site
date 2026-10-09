import Link from "next/link";

const stats = [
  ["Revenue", "Rs. 428,500", "+18.2%"],
  ["Orders", "184", "+12.4%"],
  ["Products", "426", "+8.1%"],
  ["Retailers", "68", "+21.5%"]
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed hidden h-screen w-64 bg-slate-950 p-6 text-white md:block">
        <div className="text-xl font-black">UMER ADMIN</div>
        <div className="mt-10 space-y-2">
          {[
            ["Dashboard", "/admin"],
            ["Products", "/admin/products"],
            ["Categories", "/admin/categories"],
            ["Retailer Applications", "/admin/retailers"],
            ["Orders", "/admin/orders"],
            ["Reviews", "/admin/reviews"]
          ].map(x => (
            <Link key={x[0]} href={x[1]} className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white">
              {x[0]}
            </Link>
          ))}
        </div>
      </aside>

      <main className="md:ml-64">
        <div className="border-b bg-white px-6 py-5">
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-sm text-slate-500">Business overview</p>
        </div>

        <div className="p-6">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(x => (
              <div key={x[0]} className="rounded-2xl border bg-white p-6">
                <div className="text-sm text-slate-500">{x[0]}</div>
                <div className="mt-2 text-2xl font-black">{x[1]}</div>
                <div className="mt-2 text-xs font-bold text-green-600">{x[2]}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-black">Retailer Applications</h2>
              <div className="mt-5 space-y-3">
                {["Ahmed Mobile Store", "Tech Zone", "Mobile Planet"].map((x, i) => (
                  <div key={x} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <div className="font-bold">{x}</div>
                      <div className="text-xs text-slate-400">Lahore · Application #{2048 + i}</div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Pending</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-black">Recent Orders</h2>
              <div className="mt-5 space-y-3">
                {["#UMP-10284", "#UMP-10283", "#UMP-10282"].map((x, i) => (
                  <div key={x} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <div className="font-bold">{x}</div>
                      <div className="text-xs text-slate-400">{i === 0 ? "Customer" : "Retailer"}</div>
                    </div>
                    <strong>Rs. {(19950 + i * 8500).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
