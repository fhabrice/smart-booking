# Smart Booking RDC ✨🇨🇩 — Réservation de services de cérémonie

> Tous les services de votre cérémonie, réservés en 30 secondes.

**Smart Booking RDC** est la plateforme congolaise de réservation de **tous les services de cérémonie** : mariage, dotation, baptême/doto, anniversaire, funérailles, événement d'entreprise. Construite avec **Next.js 16**, **Tailwind CSS v4**, **TypeScript** et une UX professionnelle et intuitive.

Basée en **RD Congo** 🇨🇩 — prix affichés en **USD + Franc Congolais (FC)**, paiements Mobile Money **Vodacom M-Pesa / Orange Money / Airtel Money**.

---

## 🚀 Stack Technique

- **Next.js 16.3** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- **Lucide React** — icônes
- **date-fns** — dates (locale fr)
- **HTML5 Canvas** — génération et export haute définition des affiches promotionnelles (PNG 1080x1080)
- **LocalStorage** — persistance complète : comptes prestataires, modération admin, devis/panier, réservations, messages (démo sans backend)
- Images locales (`public/images/`) — autonomie et rapidité

---

## ✨ Nouvelles Fonctionnalités Majeures

### 1. 🤝 Inscription & Connexion Prestataire (`/provider`)
- **Inscription préalable obligatoire** : formulaire d'adhésion complet pour tout nouvel établissement :
  - Nom commercial de l'entreprise
  - Responsable & contact
  - Numéro Téléphone & WhatsApp Pro (+243)
  - Ville (Kinshasa, Goma, Lubumbashi, Bukavu...) & Commune/Quartier
  - Catégorie d'activité principale
  - Années d'expérience & Numéro RCCM / Id Nat (pour vérification)
  - Présentation & bio
- **Statut d'adhésion** : nouveau compte en attente de validation administrative (visible côté admin), avec accès immédiat à son tableau de bord pour préparer ses services et affiches.
- **Connexion** : accès rapide aux comptes enregistrés et aux comptes de démonstration.

### 2. 🎨 Générateur d'Affiches Publicitaires / Flyers (`/provider/flyers`)
- Studio interactif de création d'affiches promotionnelles pour les réseaux sociaux (WhatsApp Status, Facebook, Instagram) :
  - Sélection de la prestation à promouvoir
  - Titres d'accroche personnalisables (*« OFFRE SPÉCIALE CÉRÉMONIE 2026 »*, *« PACK MARIAGE VIP »*...)
  - 4 thèmes visuels soignés :
    - 🌟 **Or Prestige & Noir** (mariage chic, royal)
    - ⚡ **Nuit Électrique & Sono** (DJ, ambiance festive, concert)
    - 🌸 **Cérémonie Rose & Ivoire** (fleurs, décoration, beauté)
    - 🌿 **Émeraude & Nature RDC** (authenticité, traiteur traditionnel)
  - Badges promotionnels (*-15% ce mois-ci*, *Acompte 50% Mobile Money*...)
  - Coordonnées WhatsApp directes et mention Smart Booking RDC
- **Export HD** : téléchargement instantané d'une affiche PNG haute résolution (1080×1080 px) via HTML5 Canvas.
- **Partage WhatsApp** : génération en 1 clic d'un lien avec texte promotionnel pré-rempli.
- **Copie presse-papier** : copie du texte publicitaire prêt à être posté.

### 3. 📊 Rapports & Statistiques Financières Prestataire (`/provider/reports`)
- Suivi du chiffre d'affaires brut, des acomptes Mobile Money perçus et du solde à encaisser sur place le jour J.
- Panier moyen par client et taux de conversion des demandes.
- Graphique d'évolution du volume d'affaires sur 6 mois.
- Répartition précise des encaissements par opérateur Mobile Money (M-Pesa, Orange Money, Airtel Money).
- Fonction **Impression / Export PDF** du bilan d'activité.

### 4. 📝 Publication de Services sous Approbation Admin (`/provider/services`)
- Les nouvelles prestations créées par un prestataire sont soumises à **validation administrative** (`adminApprovalStatus: "pending"`).
- Seules les prestations approuvées par l'administrateur sont publiées sur la vitrine client publique.
- Statuts visibles côté prestataire :
  - 🟢 **Approuvé & En ligne**
  - 🟡 **En attente d'approbation admin**
  - 🔴 **Refusé par l'admin** (avec motif explicatif pour correction)
  - ⏸️ **En pause**
- Modification en direct du tarif USD, de la réservation instantanée et des détails.

### 5. 🛡️ Espace Super-Admin (`/admin`)
Espace d'administration centralisé pour superviser la plateforme Smart Booking RDC :
- **Tableau de bord Admin (`/admin`)** :
  - KPIs plateforme (total prestataires, services en attente, volume financier global, commissions 10%)
  - Files d'attente prioritaires (nouveaux prestataires à valider, nouvelles publications à modérer)
  - Derniers messages échangés
- **Gestion des prestataires (`/admin/providers`)** :
  - Liste de tous les prestataires (démo et inscrits)
  - Actions : **Accepter / Valider**, **Suspendre / Enlever de la vitrine**, **Modifier** les informations, **Supprimer**, ou **Créer manuellement** un prestataire.
- **Modération des services (`/admin/services`)** :
  - Filtrage par statut (*À valider, Approuvés, Rejetés, En pause*)
  - Actions : **Approuver et mettre en ligne**, **Rejeter avec motif**, **Modifier** les prix/textes, **Supprimer / Enlever du catalogue**.
- **Messagerie Admin (`/admin/messages`)** :
  - Réception et traitement direct des messages des prestataires.

### 6. 🛒 Panier Multi-Prestations, Devis Estimatif Pro-Forma & Facture (`/cart`)
- Le client peut ajouter plusieurs prestations complémentaires à son devis (salle + traiteur + sono + photographe + décoration).
- **Synchronisation en 1 clic** : application automatique de la même date et heure à l'ensemble du pack cérémonie.
- **Remise Pack Cérémonie (-5%)** appliquée automatiquement dès 3 services réservés ensemble.
- **Générateur de DEVIS ESTIMATIF PRO-FORMA officiel** :
  - Référence `DEV-2026-XXXX`
  - Validité 30 jours, coordonnées de l'organisateur, détail ligne par ligne (USD et FC)
  - Acompte 50% Mobile Money et solde sur place
  - Tampon digital officiel « CERTIFIÉ CONFORME SMART BOOKING RDC »
  - Boutons Imprimer / PDF et Partager sur WhatsApp
- **Générateur de FACTURE Proforma d'acompte** :
  - Référence `FACT-2026-XXXX`
  - Détail des acomptes et numéros marchands M-Pesa, Orange Money, Airtel Money
- **Validation du panier** : réservation groupée créant automatiquement toutes les réservations dans le système.

### 7. 💬 Messagerie Intégrée Bidirectionnelle
- **Client <-> Prestataire** :
  - Accessible depuis `/bookings` (*« Discuter avec le prestataire »*) et `/services/[id]`
  - Côté prestataire dans `/provider/messages` et `/provider/bookings`
  - Échange sur les aspects logistiques, le menu, la décoration ou les horaires.
- **Prestataire <-> Administrateur** :
  - Accessible depuis `/provider/support`
  - Côté admin dans `/admin/messages`
  - Demandes d'approbation rapide, questions sur les retraits Mobile Money, certification RCCM.

---

## 🗺️ Villes couvertes en RDC

Kinshasa · Lubumbashi · Goma · Bukavu · Kisangani · Matadi · Mbuji-Mayi · Kananga

---

## 🛠️ Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.
- **Vitrine client** : `/`
- **Panier & Devis** : `/cart`
- **Espace Prestataires** : `/provider`
- **Espace Super-Admin** : `/admin` (Code PIN par défaut : `admin243` ou bouton 1-clic)
