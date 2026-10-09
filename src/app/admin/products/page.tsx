const rows = [
  ["iPhone 13 LCD Premium", "Apple", "Displays", "Rs. 12,500", "12"],
  ["Samsung A15 LCD", "Samsung", "Displays", "Rs. 7,200", "18"],
  ["iPhone 11 Battery", "Apple", "Batteries", "Rs. 4,200", "25"],
  ["Samsung S23 Charging Flex", "Samsung", "Charging Parts", "Rs. 2,800", "31"]
];

export default function AdminProducts() {
  return (
    <div className="min-h-screen bg-slate-100 p-6 md:ml-64">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div>
            <h1 className="text-2xl font-black">Products</h1>
            <p className="text-sm text-slate-500">Manage catalogue content</p>
          </div>
          <button className="rounded-xl bg-orange-500 px-5 py-3 font-black text-white">+ Add Product</button>
        </div>

        <div className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b text-slate-400">
              <tr><th className="pb-4">Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r[0]} className="border-b last:border-0">
                  <td className="py-5 font-bold">{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>{r[3]}</td>
                  <td className="text-green-600">{r[4]}</td>
                  <td><button className="font-bold text-orange-600">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
