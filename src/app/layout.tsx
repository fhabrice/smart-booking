import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/lib/booking-context";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Smart Booking — Réservation intelligente",
  description: "La plateforme de réservation la plus simple et intelligente. Trouvez et réservez en 30 secondes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fcfcf9] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        <BookingProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-xs">✦</div>
                  <span className="text-sm font-semibold">Smart Booking</span>
                  <span className="text-xs text-zinc-500">© 2026 — Fait avec ❤️ à Paris</span>
                </div>
                <div className="flex items-center gap-6 text-xs text-zinc-500">
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Confidentialité</a>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">CGU</a>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Support</a>
                </div>
              </div>
            </div>
          </footer>
        </BookingProvider>
      </body>
    </html>
  );
}
