import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/lib/booking-context";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Smart Booking Event RDC — Réservation cérémonie mariage, dot, conférence",
  description: "Première plateforme événementielle en RDC. Salles, traiteurs, décoration, sono, photo, animateurs... Prestataires vérifiés par admin dans 8 provinces : Nord-Kivu (Goma), Sud-Kivu (Bukavu), Kinshasa, Haut-Katanga (Lubumbashi) et partout en RDC. Contact: +243 976 459 970",
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
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black text-xs">✦</div>
                    <span className="text-sm font-bold">Smart Booking Event</span>
                    <span className="rounded bg-blue-600 px-1 py-0.5 text-[9px] font-bold text-white">RDC</span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                    Première plateforme événementielle en RDC. Mariage, dot, conférence, réunion. Prestataires vérifiés par admin. 8 provinces couvertes.
                  </p>
                  <div className="mt-3 text-xs font-semibold">
                    🇨🇩 Goma • Bukavu • Kinshasa • Lubumbashi • Matadi • Bunia • Kolwezi • Kananga
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide">Services</div>
                  <ul className="mt-3 space-y-2 text-xs text-zinc-500">
                    <li>Salles & Espaces de fête</li>
                    <li>Traiteur & Boissons</li>
                    <li>Décoration & Design</li>
                    <li>Sonorisation & DJ</li>
                    <li>Photo & Vidéo + Drone</li>
                    <li>Animation & MC</li>
                    <li>Location matériel</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide">RDC</div>
                  <ul className="mt-3 space-y-2 text-xs text-zinc-500">
                    <li>Nord-Kivu (Goma)</li>
                    <li>Sud-Kivu (Bukavu)</li>
                    <li>Kinshasa</li>
                    <li>Haut-Katanga (Lubumbashi)</li>
                    <li>Kongo Central (Matadi)</li>
                    <li>Ituri (Bunia)</li>
                    <li>Lualaba (Kolwezi)</li>
                    <li>Kasaï (Kananga)</li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide">Contact Admin</div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="font-bold">📞 +243 976 459 970</div>
                    <div className="text-zinc-500">WhatsApp 24/7 • Appel 8h-22h</div>
                    <div className="text-zinc-500">Français, Swahili, Lingala</div>
                    <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
                      <div className="font-semibold">Validation admin</div>
                      <div className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                        Chaque prestataire est vérifié physiquement, photos, CNI, références. Badge "Admin approuvé" = confiance.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800 md:flex-row">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>© 2026 Smart Booking Event RDC</span>
                  <span>•</span>
                  <span>Fait avec ❤️ à Goma, Nord-Kivu</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">🇨🇩 100% RDC</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Confidentialité</a>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">CGU</a>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white">Devenir prestataire</a>
                  <a href="tel:+243976459970" className="font-bold text-zinc-900 dark:text-white">+243 976 459 970</a>
                </div>
              </div>
            </div>
          </footer>
        </BookingProvider>
      </body>
    </html>
  );
}
