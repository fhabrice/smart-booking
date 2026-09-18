# Smart Booking RDC ✨🇨🇩 — Réservation de services de cérémonie

> Tous les services de votre cérémonie, réservés en 30 secondes.

**Smart Booking RDC** est une plateforme congolaise de réservation de **tous les services nécessaires à l'organisation d'une cérémonie** : mariage, dotation, baptême/doto, anniversaire, funérailles, événement d'entreprise. Construite avec **Next.js 16**, **Tailwind CSS v4**, **TypeScript** et une UX ultra-léche.

Basée en **RD Congo** 🇨🇩 — prix en **USD + Franc Congolais (FC)**, paiement **M-Pesa / Orange Money / Airtel Money**.

---

## 🚀 Stack

- **Next.js 16.3** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- **Lucide React** — icons
- **date-fns** — dates (locale fr)
- **LocalStorage** — persistance cérémonies + réservations (démo sans backend)
- Images locales (`public/images/`) — fonctionne hors-ligne

---

## ✨ Fonctionnalités

### 🏠 Page d'accueil
- Hero immersif (mariage traditionnel congolais)
- Recherche : service + **filtre par ville** (Kinshasa, Lubumbashi, Goma, Bukavu, Kisangani, Matadi, Mbuji-Mayi, Kananga)
- 9 catégories de services : 🏛️ Salles, 🍲 Traiteur, 🎀 Décoration, 🔊 Sono/DJ, 📸 Photo/Vidéo, 💄 Beauté & Mode, 🚗 Transport, 🎤 Animation, 🎂 Gâteaux
- **20 prestataires vérifiés** avec prix USD + équivalent FC
- Section « Quelle cérémonie préparez-vous ? » (6 types)

### 🎊 Planificateur de cérémonie `/events/new`
- Choix du type (mariage, dotation, anniversaire, baptême/doto, funérailles, entreprise)
- Date, heure, ville, lieu, invités, budget USD, notes
- Génère la **checklist complète des prestations** selon le type

### 📊 Tableau de bord cérémonie `/events/[id]`
- Barre de progression des prestations réservées
- Suivi du **budget** (engagé vs budget total)
- Checklist interactive → recommandations de prestataires de **votre ville en premier**
- **Déroulé du jour J** (timeline chronologique)
- Gestion/annulation des réservations de l'événement

### 🔍 Service Detail `/services/[id]`
- Gallery + badges Populaire/Instantané
- Infos prestataire vérifié + inclusions
- Avis clients (mariage, dotation, doto…)
- **Booking Widget** :
  - Calendrier 14 jours + créneaux 6h–23h
  - Détection de conflits (localStorage)
  - **Rattachement à une cérémonie** existante
  - Formulaire client : nom + **téléphone** (+243)
  - **Paiement Mobile Money** : M-Pesa, Orange Money, Airtel Money
  - **Acompte 50 %** (USD + FC) / solde sur place
  - Référence de réservation `SB-XXXXXXX`

### 📅 Mes Réservations `/bookings`
- Totaux : engagements, acomptes, solde sur place (USD + FC)
- Lien vers la cérémonie rattachée
- Annulation instantanée

---

## 💰 Devises

| Affichage | Exemple |
|---|---|
| Dollar américain (principal) | $450 |
| Franc congolais (taux indicatif 1 USD ≈ 2 850 FC) | ≈ 1 282 500 FC |

---

## 🛠️ Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## 🗺️ Villes couvertes

Kinshasa · Lubumbashi · Goma · Bukavu · Kisangani · Matadi · Mbuji-Mayi · Kananga
