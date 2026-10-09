"use client";

export default function WhatsAppButton() {
  const phone = "923000000000";

  function openWhatsApp() {
    window.open(
      `https://wa.me/${phone}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <button
      type="button"
      onClick={openWhatsApp}
      aria-label="Contact Customer Care on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl font-black text-white shadow-lg transition hover:scale-105 hover:bg-green-600"
    >
      ☎
    </button>
  );
}
