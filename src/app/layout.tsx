import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/lib/booking-context";
import { Header } from "@/components/header";
import { Smartphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Smart Booking RDC — Réservation de services de cérémonie",
  description:
    "Réservez tous les services de votre cérémonie en RDC : salles, traiteurs, décoration, sono & DJ, photo/vidéo, beauté, transport, animation, gâteaux. Mariage, dotation, baptême, anniversaire. Paiement Mobile Money.",
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
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-red-500 to-blue-600 text-xs text-white">
                    ✦
                  </div>
                  <span className="text-sm font-semibold">Smart Booking RDC</span>
                  <span className="text-xs text-zinc-500">© 2026 — Fait avec ❤️ à Kinshasa 🇨🇩</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" /> M-Pesa · Orange Money · Airtel Money
                  </span>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">
                    Confidentialité
                  </a>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">
                    CGU
                  </a>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">
                    Support WhatsApp
                  </a>
                </div>
              </div>
              <p className="mt-4 text-center text-[11px] text-zinc-400 md:text-left">
                Prix affichés en dollars américains (USD) avec équivalent en francs congolais (FC) — taux indicatif 1 USD ≈ 2 850 FC.
              </p>
            </div>
          </footer>
        </BookingProvider>
      </body>
    </html>
  );
}
