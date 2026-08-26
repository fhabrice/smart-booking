# 🇨🇩 Smart Booking Event RDC

> **La première plateforme événementielle en RDC pour réserver salles, traiteurs, décoration, sono, photo, animateurs... Vérifiés par admin, dans 8 provinces.**

**Contact Admin : +243 976 459 970 (WhatsApp 24/7, Appel 8h-22h) — Français, Swahili, Lingala**

---

## 🎯 Concept

Smart Booking Event RDC facilite la réservation de services de cérémonie au Congo :

- **Mariage** 💍
- **Dot traditionnelle** 👑
- **Conférence / Réunion** 🎤💼
- **Anniversaire, Baptême, Graduation** 🎂👶🎓
- **Concert / Festival** 🎶

### Comment ça marche ?

1. **Prestataires** (salle, traiteur, déco, sono, DJ, photo, MC, location chaises/tentes...) exposent leurs services **moyennant validation admin**.
2. **Clients** cherchent par **catégorie** et **province** (Nord-Kivu/Goma, Sud-Kivu/Bukavu, Kinshasa, Haut-Katanga/Lubumbashi, Kongo Central/Matadi, Ituri/Bunia, Lualaba/Kolwezi, Kasaï/Kananga...).
3. **Réservation automatisée** : date, heure, invités, type d'événement → acompte 30% Mobile Money (M-Pesa, Orange Money, Airtel) → **Admin valide sous 2h** → prestataire appelle sous 30 min → service garanti le jour J.

> **Modèle avec validation admin = confiance.** Chaque prestataire est vérifié physiquement (photos, CNI, références, visite si à Goma/Bukavu/Kin/Lubumbashi).

---

## ✨ Fonctionnalités actuelles

### 🏠 Accueil `/`
- Hero RDC : 8 provinces, 1,247 événements, prestataires vérifiés
- Search intelligente : service + province + catégorie
- Filtres catégories (Salles, Traiteur, Déco, Sono, Photo, Animation, Matériel)
- Filtres provinces (Nord-Kivu, Sud-Kivu, Kinshasa, Lubumbashi...)
- Grille services avec badges : `Admin approuvé`, `Instant`, `Populaire`, `En attente admin`
- Section "Comment réserver en RDC ?" (4 étapes + Mobile Money)
- CTA devenir prestataire

### 🏛️ Service Detail `/services/[id]`
- Gallery + badges admin
- Infos : province, ville, capacité, eventTypes (mariage, dot...)
- Provider vérifié : nom, avatar, expérience, téléphone, servicesCount
- Inclus, avis RDC, recommandation
- **Booking Widget** :
  - Type d'événement (mariage, dot, conférence...)
  - Nombre d'invités (+/-)
  - Calendrier 14 jours
  - Créneaux 8h-19h
  - Formulaire : nom, téléphone 🇨🇩, notes
  - Calcul prix total (si /personne)
  - Blocage si non approuvé admin
  - Résumé + bouton "Réserver"
  - Confirmation + redirection /bookings

### 📅 Mes Réservations `/bookings`
- Liste active avec détails RDC (province, ville, invités, eventType, téléphone prestataire)
- Boutons : Appeler prestataire, Annuler
- Historique annulées
- Support 24/7 +243 976 459 970

### 🤝 Devenir Prestataire `/providers`
- Formulaire inscription : nom entreprise, catégorie, province, ville, téléphone, description, photos
- Process validation admin expliqué (24h, visite physique, badge)
- Avantages : clients qualifiés, zéro appel perdu, paiement garanti, visibilité nationale
- Couverture RDC + contact direct admin

### 🧠 Smart Features RDC
- **Provinces** : Nord-Kivu (Goma), Sud-Kivu (Bukavu), Kinshasa, Haut-Katanga (Lubumbashi), Kongo Central (Matadi), Ituri (Bunia), Lualaba (Kolwezi), Kasaï (Kananga)
- **Paiement** : Mobile Money (M-Pesa, Orange Money, Airtel) + Cash, acompte 30%
- **Langues** : Français, Swahili, Lingala
- **Admin** : validation sous 2h, support WhatsApp 24/7 +243 976 459 970
- **Confiance** : badge Admin approuvé, vérification physique, contrat, garantie remboursement si no-show

---

## 📦 Stack

- **Next.js 16.3** App Router Turbopack
- **React 19**, **Tailwind CSS v4**, **TypeScript**
- **Lucide React**, **date-fns**
- **Context + localStorage** (pas de backend pour démo, mais prêt pour Prisma/Postgres)

---

## 🛠️ Installation

```bash
git clone https://github.com/fhabrice/smart-booking
cd smart-booking
npm install
npm run dev
# http://localhost:3000
```

---

## 📁 Structure

```
src/
├── app/
│   ├── page.tsx (landing RDC)
│   ├── layout.tsx (metadata RDC + contact)
│   ├── bookings/page.tsx (réservations)
│   ├── providers/page.tsx (devenir prestataire)
│   └── services/[id]/page.tsx (detail + booking)
├── components/
│   ├── header.tsx (top bar RDC + contact)
│   ├── service-card.tsx (badges admin)
│   ├── search-bar.tsx (cat + province)
│   └── booking-widget.tsx (eventType + guests + phone)
└── lib/
    ├── data.ts (16 services RDC, 8 provinces, 8 eventTypes, 8 catégories)
    ├── types.ts (Service avec province, city, adminApproved...)
    └── booking-context.tsx (localStorage rdc)
```

---

## 📊 Données mockées RDC (16 services)

- **Goma** : Salle Serena 500 places, Traiteur Mama Kivu, MC Fabrice +243 976 459 970, Beauty Queen, Salle Colline Vue Volcans, Photographe Drone Volcans
- **Bukavu** : Power Sound Sono, Jardin d'Eden Vue Lac Kivu
- **Kinshasa** : Studio Malick Photo 4K Drone, ShowBuzz Conférence 300 places, DJ Francis Beat, Location Tentes VIP, Traiteur Royal 5 étoiles
- **Lubumbashi** : Elegance Déco, Sécurité Protocole VIP
- **Matadi** : Jardin Boma Vue Fleuve Congo
- ...et 1 en attente admin (exemple du flow validation)

Chaque service : prix en USD, capacité, eventTypes, features, provider avec phone, verified, adminApproved, experience, servicesCount.

---

## 🔮 Roadmap RDC

- [ ] Auth (phone OTP)
- [ ] Paiement Mobile Money réel (M-Pesa API, Orange Money)
- [ ] Admin dashboard : validation prestataires, liste réservations, litiges
- [ ] Provider dashboard : calendrier, revenus, disponibilités
- [ ] Chat WhatsApp intégré
- [ ] Carte interactive RDC avec provinces
- [ ] Système avis + photos clients
- [ ] Contrat auto + facture
- [ ] PWA offline (important pour connexion RDC)
- [ ] Extension 26 provinces

---

## 📞 Contact

**Admin Smart Booking Event RDC**
- 📱 Téléphone / WhatsApp : **+243 976 459 970**
- 📍 Base : Goma, Nord-Kivu, RDC
- 🗣️ Langues : Français, Swahili, Lingala
- ⏰ Support : 7j/7, 8h-22h (WhatsApp 24/7)
- 📧 Email : contact@smartbooking-rdc.cd (bientôt)

> "Chaque mariage, chaque dot, chaque conférence mérite d'être parfait. On vérifie, vous célébrez." — Fabrice, Goma

---

## 📄 Licence

MIT — Fait avec ❤️ à Goma, Nord-Kivu, RDC 🇨🇩

**Objectif 2026 : couvrir les 26 provinces de la RDC et devenir la référence événementielle du Congo.**
