const applications = [
  ["Ahmed Mobile Store", "Ahmed Khan", "Lahore", "Pending"],
  ["Tech Zone", "Usman Ali", "Lahore", "Pending"],
  ["Mobile Planet", "Bilal Ahmed", "Gujranwala", "Approved"],
  ["Smart Parts", "Hamza Raza", "Islamabad", "Pending"]
];

export default function AdminRetailers() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:ml-64">
      <div className="rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-black">Retailer Applications</h1>
        <p className="text-sm text-slate-500">Review and manage wholesale applicants</p>

        <div className="mt-7 space-y-3">
          {applications.map(x => (
            <div key={x[0]} className="grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center">
              <div className="font-black">{x[0]}<div className="text-xs font-normal text-slate-400">{x[1]}</div></div>
              <div className="text-sm text-slate-500">{x[2]}</div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${x[3] === "Approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{x[3]}</span>
              <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Review</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
