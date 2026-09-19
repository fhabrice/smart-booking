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
- **Supabase (PostgreSQL)** — schéma complet `supabase-schema.sql` + client `@supabase/supabase-js` :
  prestataires, prestations, réservations, devis/factures, messagerie, retraits Mobile Money, journal d'activité
- **LocalStorage** — persistance locale automatique : le site reste 100 % fonctionnel **sans** variables Supabase
  (mode démo / hors-ligne), puis bascule sur la base dès que le projet Supabase est configuré
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
  - **Numéro de paiement / compte de réception** (M-Pesa, Orange Money ou Airtel Money) : les paiements
    des clients (acompte et solde) y sont versés **directement** à chaque réservation
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
Espace d'administration centralisé pour superviser la plateforme Smart Booking RDC.
**Accès protégé par mot de passe, vérifié côté serveur : aucun bouton de connexion « démo » et aucun code
affiché à l'écran** — le code secret vient de la variable d'environnement `ADMIN_ACCESS_CODE`
(valeur de secours : `admin243`) et n'est jamais livré au navigateur :
- **Tableau de bord Admin (`/admin`)** :
  - KPIs plateforme (total prestataires, services en attente, volume financier global, commissions de service)
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

### 7. 💰 Retraits Mobile Money (`/provider/reports`, `/admin/payouts`)
- Le prestataire demande le retrait de ses acomptes encaissés vers son numéro **M-Pesa**, **Orange Money** ou **Airtel Money**.
- Montant saisi en USD avec conversion automatique en francs congolais (taux indicatif 1 USD ≈ 2 850 FC).
- Chaque demande suit un cycle de validation admin : `en attente → en traitement → payée` (avec référence opérateur) ou `rejetée` (avec motif).
- Historique complet des transactions côté prestataire et file de validation côté admin avec compteur d'alertes.

### 8. 💬 Messagerie Intégrée Bidirectionnelle
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
- **Espace Super-Admin** : `/admin` — protégé par mot de passe, **sans bouton démo ni code affiché**.
  Le code est défini par la variable d'environnement `ADMIN_ACCESS_CODE` (secours : `admin243`).

---

## 🗄️ Base de données Supabase

Le schéma PostgreSQL complet de la plateforme se trouve à la racine du dépôt :
**[`supabase-schema.sql`](./supabase-schema.sql)**

### Contenu du schéma

| Table | Rôle |
| --- | --- |
| `providers` | Comptes prestataires (inscription, RCCM/Id.Nat, statut de validation, canal de retrait) |
| `services` | Prestations publiées + statut de modération admin (`pending` / `approved` / `rejected`) |
| `services_public` | **Vue** : vitrine client (approuvé, ni supprimé, ni en pause, prestataire non suspendu) |
| `ceremony_events` | Cérémonies créées par les clients (mariage, dot, conférence…) |
| `bookings` | Réservations, acomptes, opérateur Mobile Money et routage direct du paiement vers le compte du prestataire (répartition interne commission/part prestataire) |
| `platform_accounts` | Comptes de collecte internes de la plateforme — **accès réservé au rôle service, jamais affichés sur la plateforme** |
| `cart_items` | Panier multi-prestations |
| `quotes` | Devis pro-forma et factures d'acompte |
| `messages` | Messagerie client ↔ prestataire ↔ admin |
| `payout_requests` | Demandes de retrait Mobile Money et leur validation |
| `activity_log` | Journal d'activité de la plateforme |
| `reviews` | Avis clients |
| `categories`, `cities`, `event_types` | Référentiels (12 catégories, 10 villes, 8 types de cérémonie) |

Le script est **idempotent** (ré-exécutable sans réinstallation), crée ses propres types énumérés
(`provider_status`, `admin_approval_status`, `booking_status`, `payment_method`, `payout_status`,
`chat_role`, `activity_type`), ses triggers `updated_at` et active la **Row Level Security** :
lecture publique du catalogue approuvé, écriture réservée au rôle `service_role`.

### Installation (5 minutes)

1. Créer un projet sur [supabase.com](https://supabase.com) (région de votre choix).
2. **SQL Editor → New query** : coller le contenu de `supabase-schema.sql` puis **Run**.
3. **Project Settings → API** : copier l'*URL* et la clé *anon*.
4. Renseigner les variables d'environnement (voir [`.env.example`](./.env.example)) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=        # optionnelle, côté serveur uniquement
ADMIN_ACCESS_CODE=votre-code-secret-admin
```

### Mise à jour d'un projet existant

Le script étant idempotent, une nouvelle version se déploie en le **rejouant intégralement** :
**SQL Editor → New query** → coller `supabase-schema.sql` à jour → **Run**. Les tables, types,
politiques et données existantes sont conservés ; seuls les objets manquants sont créés.

Exemple — version « paiement direct + commission interne » :

- colonnes ajoutées à `bookings` : `provider_payout_method`, `provider_payout_number`,
  `commission_rate` (`0.04`), `platform_fee`, `provider_net` ;
- table `platform_accounts` créée et initialisée (2 comptes de collecte, RLS rôle service) ;
- réservations antérieures reprises automatiquement : compte de réception recopié depuis le
  profil prestataire et répartition 4 % / 96 % calculée sur l'acompte encaissé (les lignes déjà
  renseignées ne sont jamais écrasées).

Les requêtes de contrôle à lancer après le rejeu figurent en fin de script (section 6).

### Intégration dans le code

| Fichier | Rôle |
| --- | --- |
| `src/lib/supabase/client.ts` | Clients Supabase : `getSupabase()` (navigateur, clé anon) et `getSupabaseAdmin()` (serveur, clé service — refuse de s'exécuter côté client) |
| `src/lib/supabase/db.ts` | Requêtes et mappers ligne SQL ↔ types TypeScript (`rowToService`, `rowToProvider`, `rowToBooking`, `rowToMessage`, `rowToPayout`) |
| `src/lib/supabase/sync.ts` | Miroir d'écriture **fire-and-forget** branché sur les contextes React : inscription prestataire, publication/approbation de service, réservation, devis, message, demande et paiement de retrait |

**Principe de bascule** : `isSupabaseConfigured` vaut `false` tant que les variables sont absentes —
toutes les fonctions de synchronisation deviennent alors des no-ops et l'application continue
d'utiliser sa persistance `localStorage`. Aucune erreur, aucun écran blanc : la base de données
s'active simplement en ajoutant les variables, sans réécrire l'interface.

---

## 🔐 Sécurité de l'espace admin

- L'écran de connexion `/admin` demande le code secret ; **il n'affiche ni code par défaut ni bouton d'accès « démo » 1-clic**.
- La vérification est **côté serveur** : Route Handler `POST/GET /api/admin/auth`
  (`src/app/api/admin/auth/route.ts`). Le code ne figure donc dans **aucun bundle JavaScript** livré au navigateur.
- Comparaison en temps constant (`crypto.timingSafeEqual`) contre la variable `ADMIN_ACCESS_CODE` (secours : `admin243`).
- Session matérialisée par un **cookie httpOnly signé (HMAC-SHA256)** : `Secure` en production, `SameSite=lax`,
  durée 12 h. Il ne peut pas être forgé depuis le navigateur sans connaître le code.
- Les codes de développement (`admin`, `smart2026`) ne sont acceptés **que** lorsque `NODE_ENV !== "production"`.
- `logout()` révoque le cookie côté serveur.

> ⚠️ En production, définissez `ADMIN_ACCESS_CODE` dans Netlify avec une valeur forte : la valeur de
> secours `admin243` est publique (documentée dans ce README).

---

## ▲ Déploiement Netlify

1. **Build command** : `npm run build` — **Publish directory** : géré par le runtime Next.js de Netlify
   (installer `@netlify/plugin-nextjs` si ce n'est pas déjà fait automatiquement).
2. **Node** : 20 ou supérieur (le dépôt est validé avec Node 22).
3. **Site settings → Environment variables** : ajouter `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (optionnelle) et `ADMIN_ACCESS_CODE`.
4. Les variables préfixées `NEXT_PUBLIC_` sont injectées **au build** : relancer un déploiement après
   toute modification (Deploys → Trigger deploy).
5. Exécuter `supabase-schema.sql` dans Supabase **avant** le premier déploiement activant la base.

Sans ces variables, Netlify publie le site en mode local (`localStorage`) : la vitrine, le panier,
les devis, l'espace prestataire et l'espace admin restent pleinement fonctionnels.
