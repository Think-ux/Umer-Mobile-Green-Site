"use client";

import Link from "next/link";

export default function Footer() {
  const whatsappNumber = "923000000000";

  return (
    <footer className="border-t bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">

        {/* BRAND */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-xl font-black">
              U
            </div>

            <div>
              <div className="text-lg font-black">
                Umer
              </div>
              <div className="text-xs font-bold text-orange-400">
                MOBILE PARTS
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-400">
            Quality mobile spare parts, displays, batteries,
            charging parts and accessories across Pakistan.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-black">
            Quick Links
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <Link
              href="/shop/displays"
              className="transition hover:text-orange-400"
            >
              Shop
            </Link>

            <Link
              href="/search"
              className="transition hover:text-orange-400"
            >
              Search Parts
            </Link>

            <Link
              href="/cart"
              className="transition hover:text-orange-400"
            >
              Shopping Cart
            </Link>

            <Link
              href="/retailer"
              className="transition hover:text-orange-400"
            >
              For Retailers
            </Link>
          </div>
        </div>

        {/* CUSTOMER CARE */}
        <div>
          <h3 className="text-lg font-black">
            Customer Care
          </h3>

          <div className="mt-5 space-y-4 text-sm">

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-slate-300 transition hover:text-green-400"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 font-black text-white">
                W
              </span>

              <div>
                <div className="font-bold">
                  WhatsApp
                </div>
                <div className="text-xs text-slate-500">
                  Chat with us
                </div>
              </div>
            </a>

            <a
              href="tel:+923000000000"
              className="flex items-center gap-3 text-slate-300 transition hover:text-orange-400"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 font-black text-white">
                ☎
              </span>

              <div>
                <div className="font-bold">
                  Call Us
                </div>
                <div className="text-xs text-slate-500">
                  0300 0000000
                </div>
              </div>
            </a>

            <div className="text-slate-400">
              <div className="font-bold text-slate-300">
                Business Hours
              </div>
              <div className="mt-1">
                Monday - Saturday
              </div>
              <div>
                10:00 AM - 8:00 PM
              </div>
            </div>

          </div>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-black">
            Contact
          </h3>

          <div className="mt-5 space-y-4 text-sm text-slate-400">

            <div>
              <div className="font-bold text-slate-300">
                Location
              </div>
              <div className="mt-1">
                Lahore, Pakistan
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-300">
                Phone
              </div>
              <div className="mt-1">
                0300 0000000
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-300">
                Email
              </div>
              <div className="mt-1">
                support@umermobileparts.com
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-center text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:text-left">
          <p>
            © 2026 Umer Mobile Parts. All rights reserved.
          </p>

          <p>
            Trusted Mobile Parts Store in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
