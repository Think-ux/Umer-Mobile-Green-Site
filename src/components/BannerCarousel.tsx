"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreBanner } from "@/components/CatalogProvider";

type Props = {
  banners: StoreBanner[];
  label: string;
};

export default function BannerCarousel({ banners, label }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (banners.length < 2 || !autoPlay || hovered || focused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [autoPlay, banners.length, focused, hovered]);

  if (banners.length === 0) return null;

  const visibleIndex = activeIndex % banners.length;
  const showControls = banners.length > 1;

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + banners.length) % banners.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % banners.length);
  }

  return (
    <section
      aria-label={label}
      aria-roledescription="carousel"
      className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-lg">
        <div
          className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${visibleIndex * 100}%)` }}
          aria-live={autoPlay && !hovered && !focused ? "off" : "polite"}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${banners.length}`}
              aria-hidden={index !== visibleIndex}
              className="w-full flex-none"
            >
              <Link
                href={`/banner/${banner.id}`}
                tabIndex={index === visibleIndex ? 0 : -1}
                aria-label={`View banner: ${banner.title}`}
                className="group relative flex aspect-[16/8] min-h-52 items-end overflow-hidden bg-cover bg-center p-5 sm:aspect-[16/6] sm:min-h-64 sm:p-8 lg:aspect-[16/5]"
                style={{
                  backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.78), rgba(15,23,42,.08)), url("${banner.image_url}")`,
                }}
              >
                <span className="text-xl font-black text-white transition group-hover:text-orange-200 sm:text-2xl lg:text-3xl">
                  {banner.title}
                </span>
              </Link>
            </div>
          ))}
        </div>

        {showControls && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-5">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Show previous banner"
                className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl font-black text-slate-900 shadow transition hover:bg-white sm:h-12 sm:w-12"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Show next banner"
                className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl font-black text-slate-900 shadow transition hover:bg-white sm:h-12 sm:w-12"
              >
                ›
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAutoPlay((playing) => !playing)}
              aria-label={autoPlay ? "Pause automatic banner rotation" : "Resume automatic banner rotation"}
              aria-pressed={!autoPlay}
              className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-950"
            >
              {autoPlay ? "Pause" : "Play"}
            </button>
          </>
        )}
      </div>

      {showControls && (
        <div className="mt-3 flex justify-center gap-2" aria-label="Choose a banner">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show banner ${index + 1}: ${banner.title}`}
              aria-current={index === visibleIndex ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                index === visibleIndex ? "w-7 bg-orange-500" : "w-2.5 bg-slate-300 hover:bg-orange-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
