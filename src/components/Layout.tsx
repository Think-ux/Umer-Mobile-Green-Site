"use client";

"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCatalog } from "@/components/CatalogProvider";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => {
    const nextDarkMode = !darkMode;
    document.documentElement.dataset.theme = nextDarkMode ? "dark" : "light";
    setDarkMode(nextDarkMode);
  };

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-canvas p-6 text-content-secondary" role="status">
          Loading page…
        </main>
      }
    >
      <RouteLayout darkMode={darkMode} onToggleTheme={toggleTheme}>
        {children}
      </RouteLayout>
    </Suspense>
  );
}

function RouteLayout({
  children,
  darkMode,
  onToggleTheme,
}: {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { status, error } = useCatalog();

  return (
    <div className="min-h-screen bg-surface">
      {isAdmin ? (
        children
      ) : (
        <>
          <Header darkMode={darkMode} onToggleTheme={onToggleTheme} />
          {(status === "error" || status === "unconfigured") && (
            <p
              role="status"
              className="ui-feedback ui-feedback--warning text-center text-xs font-semibold"
            >
              {status === "unconfigured"
                ? "The live catalog is unavailable because Supabase is not configured."
                : `Could not load the live catalog. No sample products are being shown. ${error}`}
            </p>
          )}
          {children}
          <Footer />
        </>
      )}
    </div>
  );
}
