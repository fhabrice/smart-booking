# Smart Booking ✨ — Réservation intelligente

> Réservez en 30 secondes, pas en 30 minutes.

**Smart Booking** est une plateforme moderne de réservation de services (beauté, bien-être, business, coaching) construite avec **Next.js 16**, **Tailwind CSS v4**, **TypeScript** et une UX ultra-léche.

Inspirée par Linear, Airbnb et Revolut — focus sur la vitesse, la clarté et la confiance.

---

## 🚀 Stack

- **Next.js 16.3** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- **Lucide React** — icons
- **Framer Motion** — animations
- **date-fns** — dates
- **LocalStorage** — persistance bookings (sans backend pour la démo)

---

## ✨ Fonctionnalités

### 🏠 Page d'accueil
- Hero avec gradient + social proof
- Barre de recherche intelligente (service + localisation + date)
- Filtres catégories avec compteurs
- Grille services avec card premium (hover effects, badges Instant/Populaire)
- Section "Comment ça marche" (3 étapes)
- Stats temps réel

### 🔍 Service Detail `/services/[id]`
- Gallery + badges
- Infos prestataire vérifié
- Description longue + inclusions
- Recommandation IA
- Avis clients
- **Booking Widget** sticky :
  - Calendrier 14 jours
  - Créneaux temps réel (8h-19h, 30min)
  - Détection conflits (localStorage)
  - Formulaire client
  - Résumé prix
  - Confirmation animée + redirection

### 📅 Mes Réservations `/bookings`
- Liste réservations actives
- Annulation instantanée
- Historique annulées
- Support 24/7 CTA

### 🧠 Smart Features
- **IA de recommandation** (UI) : suggère meilleur créneau
- **Instant Booking** : sans appel
- **Vérification** : prestataires vérifiés
- **Conflit detection** : pas de double booking
- **Persistance** : localStorage + Context API

---

## 📦 Installation

```bash
git clone https://github.com/fhabrice/smart-booking
cd smart-booking
npm install
npm run dev
```

Ouvre http://localhost:3000

---

## 🛠️ Scripts

```bash
npm run dev     # Dev server Turbopack
npm run build   # Build prod
npm run start   # Start prod
npm run lint    # ESLint
```

---

## 📁 Structure

```
src/
├── app/
│   ├── page.tsx              # Landing + search + grid
│   ├── layout.tsx            # Root layout + provider
│   ├── globals.css           # Tailwind v4
│   ├── bookings/page.tsx     # Mes réservations
│   └── services/[id]/page.tsx # Detail + booking
├── components/
│   ├── header.tsx
│   ├── service-card.tsx
│   ├── search-bar.tsx
│   ├── booking-widget.tsx
│   └── ui/button.tsx, badge.tsx
└── lib/
    ├── data.ts               # 12 services mockés
    ├── types.ts
    ├── utils.ts              # cn, formatPrice, timeSlots
    └── booking-context.tsx   # Context + localStorage
```

---

## 🎨 Design System

- **Radius** : 24px cards, full buttons (pill)
- **Couleurs** : zinc-900 primary, violet accent, emerald success
- **Shadows** : soft, colored
- **Typography** : Geist Sans (fallback system), tight tracking
- **Inspiration** : Linear.app + Airbnb + Stripe

---

## 🔮 Roadmap

- [ ] Auth (Clerk / NextAuth)
- [ ] Paiement Stripe
- [ ] Vraie DB (Prisma + Postgres)
- [ ] Notifications email / SMS
- [ ] Dashboard prestataire
- [ ] IA vraie (recommandation embeddings)
- [ ] PWA + offline
- [ ] i18n EN/FR

---

## 📸 Screenshots

> Landing : hero + search + categories
> Service : gallery + booking widget
> Bookings : liste + annulation

---

## 👨‍💻 Auteur

Fait avec ❤️ à Paris — 2026

> "Le meilleur code est celui que l'utilisateur ne voit pas. Juste la réservation qui marche."

---

## 📄 Licence

MIT
