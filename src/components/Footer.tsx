"use client";

import Link from "next/link";

export default function Footer() {
  const phone = "03008897768";
  const whatsapp = "923008897768";

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">

        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-xl font-black">
              U
            </div>
            <div>
              <div className="text-lg font-black">Umer</div>
              <div className="text-xs font-bold tracking-wider text-orange-400">
                MOBILE PARTS
              </div>
            </div>
          </Link>

          <p className="mt-5 text-sm leading-6 text-slate-400">
            Find mobile spare parts for your device, including displays,
            batteries, charging parts and other replacement components.
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold">Quick Links</h3>
          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
            <Link className="hover:text-orange-400" href="/">Home</Link>
            <Link className="hover:text-orange-400" href="/shop/displays">Shop Products</Link>
            <Link className="hover:text-orange-400" href="/search">Search Products</Link>
            <Link className="hover:text-orange-400" href="/cart">Shopping Cart</Link>
            <Link className="hover:text-orange-400" href="/track-order">Track Order</Link>
            <Link className="hover:text-orange-400" href="/retailer">For Retailers</Link>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold">Product Categories</h3>
          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
            <Link className="hover:text-orange-400" href="/shop/displays">Displays</Link>
            <Link className="hover:text-orange-400" href="/shop/batteries">Batteries</Link>
            <Link className="hover:text-orange-400" href="/shop/charging-parts">Charging Parts</Link>
            <Link className="hover:text-orange-400" href="/shop/camera-parts">Camera Parts</Link>
            <Link className="hover:text-orange-400" href="/shop/housing">Housing</Link>
            <Link className="hover:text-orange-400" href="/shop/flex">Flex</Link>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold">Contact Us</h3>

          <div className="mt-5 flex flex-col gap-5 text-sm">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-slate-300 hover:text-green-400"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-600 text-xl">
                W
              </span>
              <span>
                <span className="block font-bold">WhatsApp</span>
                <span className="mt-1 block text-slate-400">{phone}</span>
                <span className="block text-xs text-slate-500">Chat with us</span>
              </span>
            </a>

            <a
              href={`tel:+92${phone.substring(1)}`}
              className="flex items-start gap-3 text-slate-300 hover:text-orange-400"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-xl">
                {"\u260E"}
              </span>
              <span>
                <span className="block font-bold">Mobile Contact</span>
                <span className="mt-1 block text-slate-400">{phone}</span>
                <span className="block text-xs text-slate-500">Call us</span>
              </span>
            </a>

            <div className="flex items-start gap-3 text-slate-300">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xl">
                {"\u{1F4CD}"}
              </span>
              <span>
                <span className="block font-bold">Our Location</span>
                <span className="mt-1 block leading-6 text-slate-400">
                  Zam Zam Mall, Singhpura, Lahore
                </span>
                <a
                  className="mt-2 inline-block text-xs font-semibold text-orange-400 hover:text-orange-300"
                  href="https://www.google.com/maps/search/?api=1&query=Zam+Zam+Mall+Singhpura+Lahore"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Map
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{"\u00A9"} 2026 Umer Mobile Parts. All rights reserved.</p>
          <p>Mobile Spare Parts - Singhpura, Lahore</p>
        </div>
      </div>
    </footer>
  );
}
