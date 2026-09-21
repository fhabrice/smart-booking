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
- **100 % base de données** — TOUTES les données proviennent de Supabase (plus aucune donnée de démo,
  plus aucun état métier en localStorage) :
    - le navigateur appelle exclusivement les **Route Handlers `/api/*`** (lecture + écriture) ;
    - seuls les identifiants de session (prestataire connecté, panier, réservations de l'appareil,
      fils de discussion du visiteur) restent en localStorage — simples pointeurs, jamais de contenu ;
    - la clé `service_role` reste côté serveur ; les politiques RLS bloquent toute écriture directe navigateur.
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
- **Connexion** : accès rapide aux comptes enregistrés dans la base (`providers`).

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
  - Liste de tous les prestataires enregistrés en base
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
npm run dev:local      # base PostgreSQL embarquée + API REST locale + next dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.
- **Vitrine client** : `/`
- **Panier & Devis** : `/cart`
- **Espace Prestataires** : `/provider`
- **Espace Super-Admin** : `/admin` — protégé par mot de passe, **sans bouton démo ni code affiché**.
  Le code est défini par la variable d'environnement `ADMIN_ACCESS_CODE` (secours : `admin243`).

> `npm run dev` seul fonctionne aussi, mais **sans base de données configurée** la vitrine affiche
> l'état vide « Base de données requise » — branchez `dev:local` (ci-dessous) ou un vrai projet
> Supabase pour charger le catalogue.

---

## 🖥️ Développement local — PostgreSQL embarqué (`dev:local`)

Sans compte Supabase — ou sans accès réseau à `*.supabase.co` — la plateforme tourne
**entièrement en local** sur une vraie base PostgreSQL :

```bash
npm run dev:local
```

Cette seule commande démarre :

1. un **PostgreSQL 18 embarqué** (binaire réel via [`embedded-postgres`](https://www.npmjs.com/package/embedded-postgres)),
   données persistées dans `.pgdata/` (ignoré par Git), port `54322` ;
2. l'installation **automatique et idempotente** de `supabase-schema.sql` puis du
   catalogue initial réel `seed-catalog.sql` (6 prestataires + 20 prestations)
   à la première exécution ;
3. un **serveur REST local compatible PostgREST/Supabase**
   ([`scripts/local-rest-server.mjs`](./scripts/local-rest-server.mjs)) sur
   `http://127.0.0.1:54321/rest/v1` — l'API exacte que parle `@supabase/supabase-js`
   (filtres, `or`, relations embarquées, upsert, `Prefer: return=representation`…) :
   **le code applicatif n'est pas modifié**, il croit parler à Supabase ;
4. `next dev` sur le port `3000` avec `SUPABASE_URL` pointant vers ce serveur.

La vitrine affiche alors les **données réelles du catalogue** enregistrées en base —
le même comportement qu'avec un projet Supabase, sans aucune donnée de démo.

| Commande | Rôle |
| --- | --- |
| `npm run dev:local` | Tout-en-un : PostgreSQL + REST + `next dev` |
| `npm run db:local` | PostgreSQL + REST uniquement (pour lancer `npm run dev` séparément) |
| `npm run db:local:reset` | Supprime `.pgdata/` puis réinstalle schéma + catalogue |

À savoir :

- `.env.local` est préconfiguré pour ce mode (`SUPABASE_URL=http://127.0.0.1:54321`
  et clé locale factice `local-dev-service-role-key`) ; pour repasser sur un **vrai
  projet Supabase**, remplacez simplement les deux variables (voir `.env.example`).
- Variables surchargeables : `LOCAL_PG_PORT` (54322), `LOCAL_REST_PORT` (54321),
  `APP_PORT` (3000), `ADMIN_ACCESS_CODE` (admin243).
- `npm run seed` (chargement REST du catalogue) fonctionne aussi contre la base locale :
  `SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=local-dev-service-role-key npm run seed`.
- ⚠️ Mode **développement uniquement** : la clé locale n'est pas vérifiée et les
  serveurs n'écoutent que sur `127.0.0.1` ; n'exposez jamais ce processus sur un
  réseau public. En production, utilisez un vrai projet Supabase (ci-dessous).

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
3. **SQL Editor → New query** : coller le contenu de `seed-catalog.sql` puis **Run**
   (catalogue initial réel : 6 prestataires + 20 prestations).
4. **Project Settings → API** : copier l'*URL* du projet et la clé *service_role*.
5. Renseigner les variables d'environnement (voir [`.env.example`](./.env.example)) :

```bash
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # SECRET — côté serveur uniquement
ADMIN_ACCESS_CODE=votre-code-secret-admin
```

> En alternative au SQL Editor, `npm run seed` charge le catalogue initial
> directement via l'API REST (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).

### Mise à jour d'un projet existant

Le moyen le plus simple : exécuter **`migration-paiement-direct.sql`** (SQL Editor → New query →
coller le fichier → Run). Ce script autonome applique la version « paiement direct + commission
interne » en une seule transaction atomique — colonnes de `bookings`, table interne
`platform_accounts` (RLS rôle service, 2 comptes de collecte), reprise des réservations
existantes (compte de réception recopié depuis le prestataire + répartition 4 % / 96 % sur
l'acompte, jamais écrasée) — puis affiche lui-même une grille de contrôle (`✅ OK` attendu).

Alternative : le script complet `supabase-schema.sql` étant idempotent, on peut aussi le
**rejouer intégralement** — tables, types, politiques et données existantes sont conservés ;
seuls les objets manquants sont créés. Requêtes de contrôle en fin de script (section 6).

### Intégration dans le code

| Fichier | Rôle |
| --- | --- |
| `src/lib/server/supabase.ts` | Client Supabase **serveur** (`getSupabaseAdmin()`, clé service_role — refuse de s'exécuter côté client) et état `isSupabaseConfigured` |
| `src/lib/server/db.ts` | Couche d'accès aux données : requêtes et mappers ligne SQL ↔ types TypeScript (`rowToService`, `rowToProvider`, `rowToBooking`, `rowToMessage`, `rowToPayout`) |
| `src/app/api/*` | Route Handlers serveur — **seule porte d'entrée** du navigateur vers la base (lecture + écriture) |

**Principe de bascule** : `isSupabaseConfigured` vaut `false` tant que `SUPABASE_URL` et
`SUPABASE_SERVICE_ROLE_KEY` sont absentes — les routes `/api/*` répondent alors `503`
avec un message explicite et l'interface affiche un état vide clair (« Base de données
requise »). Il n'existe **plus aucune donnée de démo ni de secours** : la vitrine
n'affiche que des données réelles enregistrées en base. La base s'active simplement
en ajoutant les variables (vrai projet Supabase ou `npm run dev:local`), sans
réécrire l'interface.

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
