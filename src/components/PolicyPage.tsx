import Link from "next/link";

type PolicyPageProps = {
  title: string;
  description: string;
  confirmationItems: string[];
};

export default function PolicyPage({
  title,
  description,
  confirmationItems,
}: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">Umer Mobile Parts</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <h2 className="font-black">Business confirmation required</h2>
          <p className="mt-2 text-sm leading-6">
            This page is not a final business policy. The details below must be confirmed by Umer Mobile Parts before customers can rely on them.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
            {confirmationItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <p className="mt-6 leading-7 text-slate-600">
          For help with an existing order, contact the store before taking action.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/customer-care" className="ui-button-primary">Contact Customer Care</Link>
          <Link href="/faq" className="inline-flex min-h-11 items-center font-bold text-orange-700 hover:text-orange-800">Read FAQs</Link>
        </div>
      </article>
    </main>
  );
}
