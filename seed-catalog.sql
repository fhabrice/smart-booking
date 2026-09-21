-- ============================================================================
--  SMART BOOKING RDC 🇨🇩 — CATALOGUE INITIAL (SEED)
--  ----------------------------------------------------------------------------
--  Charge UNE SEULE FOIS le contenu initial réel de la plateforme :
--    • 6 comptes prestataires partenaires (approuvés)
--    • 20 prestations de cérémonie (approuvées, en vitrine)
--
--  À exécuter dans : Supabase Studio → SQL Editor → New query → Run
--  APRÈS avoir exécuté supabase-schema.sql (et migration-paiement-direct.sql
--  si la base date d'avant le paiement direct).
--
--  Idempotent : rejouable sans doublon (ON CONFLICT DO NOTHING).
--  Après ce chargement, le site lit 100 % de ses données dans la base :
--  modifiez / supprimez ce contenu depuis l'espace Admin ou le SQL Editor.
-- ============================================================================

begin;

-- 1. Prestataires partenaires ------------------------------------------------
insert into public.providers (
  id, name, contact_person, phone, whatsapp, email, city, location, category,
  experience, bio, rccm, status, rating, reviews_count, verified, avatar,
  registered_at, payout_method, payout_number
) values (
  'prov-grand-salon', 'Grand Salon Kin', 'Dieudonné Makiese', '+243 821 110 021', '+243 821 110 021',
  'contact@grandsalonkin.cd', 'Kinshasa', 'Gombe · Av. du 24 novembre', 'salles', '15 ans d''expérience',
  'Salle de prestige de 300 places climatisée avec parking sécurisé au cœur de la Gombe.', 'CD/KIN/RCCM/18-B-0429', 'approved', 4.9, 148,
  true, '/images/avatar-1.jpg', '2025-01-10T10:00:00.000Z',
  'M-Pesa', '+243 821 110 021'
) on conflict (id) do nothing;
insert into public.providers (
  id, name, contact_person, phone, whatsapp, email, city, location, category,
  experience, bio, rccm, status, rating, reviews_count, verified, avatar,
  registered_at, payout_method, payout_number
) values (
  'prov-palais-katanga', 'Palais du Katanga', 'Chantal Tshilombo', '+243 998 770 032', '+243 998 770 032',
  'reservation@palaiskatanga.cd', 'Lubumbashi', 'Golf Météo · Av. des Baobabs', 'salles', '10 ans d''expérience',
  'Complexe événementiel d''exception de 500 places à Lubumbashi.', 'CD/LSH/RCCM/19-A-1102', 'approved', 4.8, 96,
  true, '/images/avatar-2.jpg', '2025-02-14T08:30:00.000Z',
  'Orange Money', '+243 998 770 032'
) on conflict (id) do nothing;
insert into public.providers (
  id, name, contact_person, phone, whatsapp, email, city, location, category,
  experience, bio, rccm, status, rating, reviews_count, verified, avatar,
  registered_at, payout_method, payout_number
) values (
  'prov-kivu-lake', 'Kivu Lake View Gardens', 'Jacques Safari', '+243 971 445 566', '+243 971 445 566',
  'contact@kivugardens.cd', 'Goma', 'Himbi · Bord du Lac Kivu', 'salles', '8 ans d''expérience',
  'Jardins et chapiteau panoramique les pieds dans l''eau pour cérémonies inoubliables.', 'CD/GOM/RCCM/21-B-0834', 'approved', 4.9, 112,
  true, '/images/avatar-3.jpg', '2025-03-01T12:00:00.000Z',
  'Airtel Money', '+243 971 445 566'
) on conflict (id) do nothing;
insert into public.providers (
  id, name, contact_person, phone, whatsapp, email, city, location, category,
  experience, bio, rccm, status, rating, reviews_count, verified, avatar,
  registered_at, payout_method, payout_number
) values (
  'prov-saveurs-kin', 'Saveurs du Fleuve Traiteur', 'Chef Aimé Bamporiki', '+243 810 990 044', '+243 810 990 044',
  'traiteur@saveursdufleuve.cd', 'Kinshasa', 'Ngaliema · Ma Campagne', 'traiteur', '12 ans d''expérience',
  'Haute gastronomie congolaise et buffet international pour mariages et réceptions VIP.', NULL, 'approved', 4.9, 204,
  true, '/images/avatar-4.jpg', '2025-01-20T14:15:00.000Z',
  'M-Pesa', '+243 810 990 044'
) on conflict (id) do nothing;
insert into public.providers (
  id, name, contact_person, phone, whatsapp, email, city, location, category,
  experience, bio, rccm, status, rating, reviews_count, verified, avatar,
  registered_at, payout_method, payout_number
) values (
  'prov-lumumba-events', 'Lumumba Événements Déco', 'Nathalie Kalonji', '+243 854 321 009', '+243 854 321 009',
  'deco@lumumbaevents.cd', 'Kinshasa', 'Limete · 7e Rue Résidentiel', 'decoration', '9 ans d''expérience',
  'Créations florales d''exception, trônes de mariés et scénographie lumineuse moderne.', NULL, 'approved', 5, 88,
  true, '/images/avatar-5.jpg', '2025-02-05T09:00:00.000Z',
  'Orange Money', '+243 854 321 009'
) on conflict (id) do nothing;
insert into public.providers (
  id, name, contact_person, phone, whatsapp, email, city, location, category,
  experience, bio, rccm, status, rating, reviews_count, verified, avatar,
  registered_at, payout_method, payout_number
) values (
  'prov-sound-kin', 'Kinshasa Sound & Light VIP', 'DJ Rodrigue', '+243 900 234 567', '+243 900 234 567',
  'booking@kinsoundvip.cd', 'Kinshasa', 'Kalamu · Victoire', 'sono', '11 ans d''expérience',
  'Système line array 10 000 Watts, projecteurs robotisés, fumée lourde et DJ animateur polyglotte.', NULL, 'approved', 4.9, 167,
  true, '/images/avatar-6.jpg', '2025-01-28T16:45:00.000Z',
  'Airtel Money', '+243 900 234 567'
) on conflict (id) do nothing;

-- 2. Prestations de cérémonie -------------------------------------------------
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'salle-kin',
  (select id from public.providers where lower(name) = lower('Grand Salon Kin') limit 1),
  'Grand Salon Kin', 'Grand Salon Kin — Salle de réception', 'salles', 'Salle climatisée de 300 places, avenue du 24 novembre', 'La salle la plus demandée de Gombe pour les mariages et dotations. 300 places assises, climatisation centrale, scène pour orchestre, parking gardé 24h pour 60 véhicules, groupe électrogène de pleine puissance. Le personnel d''accueil (2 hôtesses + sécurité) est inclus. Décoration possible via nos partenaires.',
  600, 'la journée', 600, 4.9, 148,
  '/images/hall-1.jpg', ARRAY['/images/hall-1.jpg', '/images/deco-1.jpg'], 'Kinshasa', 'Gombe · Av. du 24 novembre',
  ARRAY['300 places assises', 'Climatisation centrale', 'Scène + loge mariés', 'Parking gardé 60 voitures', 'Groupe électrogène', 'Hôtesses d''accueil incluses'], true, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'salle-palmier',
  (select id from public.providers where lower(name) = lower('Palmier Palace') limit 1),
  'Palmier Palace', 'Le Palmier Palace — Espace événementiel', 'salles', 'Espace de 250 places avec cour extérieure ombragée', 'Espace polyvalent au cœur de Lubumbashi : grande salle de 250 places + cour extérieure ombragée pour les cocktail et photographies. Cuisine sur place disponible pour vos traiteurs, chapiteaux de réserve en cas de pluie, et sonorisation de base incluse. Idéal mariages, dotations et séminaires.',
  450, 'la journée', 600, 4.8, 96,
  '/images/hall-2.jpg', ARRAY['/images/hall-2.jpg'], 'Lubumbashi', 'Golf · Av. Kasaï',
  ARRAY['250 places', 'Cour extérieure', 'Cuisine sur place', 'Chapiteaux anti-pluie', 'Sono de base'], false, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'salle-jardin',
  (select id from public.providers where lower(name) = lower('Jardin du Fleuve') limit 1),
  'Jardin du Fleuve', 'Jardin du Fleuve — Réception en plein air', 'salles', 'Jardin au bord du fleuve, guirlandes lumineuses au couchant', 'Un jardin magique au bord de l''eau pour vos réceptions au coucher du soleil : pelouse de 800 m², guirlandes lumineuses, kiosque pour les photos de couple, et vue imprenable sur le fleuve. Capacité 150 invités. Parfait pour les mariages intimistes, dotations et anniversaires.',
  350, 'la soirée', 360, 4.9, 74,
  '/images/garden-1.jpg', ARRAY['/images/garden-1.jpg', '/images/deco-2.jpg'], 'Kinshasa', 'Ma Vallée · Ngaliema',
  ARRAY['150 invités', 'Guirlandes lumineuses', 'Kiosque photos', 'Vue fleuve', 'Parking sécurisé'], true, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'traiteur-maman-ngo',
  (select id from public.providers where lower(name) = lower('Maman Ngo & Filles') limit 1),
  'Maman Ngo & Filles', 'Chez Maman Ngo — Traiteur cérémonie', 'traiteur', 'Pondu, makemba, poisson grillé, riz gras — buffet généreux', 'La référence du traiteur traditionnel congolais pour les grandes occasions. Buffet complet : pondu, chikwanga, makemba, riz gras, poulet mayonnaise, poisson grillé, goat meat en sauce. Service en buffet avec vaisselle complète, serveurs en tenue, et boissons locales incluses (Primus, Fanta, eau). Goûter avant de commander, c''est possible !',
  12, 'par invité', 300, 4.9, 213,
  '/images/food-1.jpg', ARRAY['/images/food-1.jpg', '/images/food-2.jpg'], 'Kinshasa', 'Bandal · Cuisines centrales',
  ARRAY['Buffet complet congolais', 'Serveurs en tenue inclus', 'Vaisselle & nappes fournies', 'Boissons locales incluses', 'Dégustation préalable', 'Tentes & matériel sur option'], true, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'traiteur-saveurs',
  (select id from public.providers where lower(name) = lower('Saveurs du Congo') limit 1),
  'Saveurs du Congo', 'Saveurs du Congo — Catering moderne', 'traiteur', 'Cuisine congolaise revisitée + menu continental', 'Catering haut de gamme qui marie saveurs congolaises et présentation moderne : minibuffets dressés, stations de brochettes de tilapia, captain''s dinner pour la table d''honneur. Options végétariennes et menus enfants. Personnel formé en hôtellerie, service à l''assiette ou au buffet au choix.',
  18, 'par invité', 300, 4.8, 87,
  '/images/food-2.jpg', ARRAY['/images/food-2.jpg'], 'Goma', 'Himbi · Av. du Tourisme',
  ARRAY['Menu congolais + continental', 'Service à l''assiette', 'Table d''honneur captain', 'Menus enfants', 'Options végé'], false, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'deco-elegance',
  (select id from public.providers where lower(name) = lower('Déco Élégance') limit 1),
  'Déco Élégance', 'Déco Élégance — Habillage salle & chaises', 'decoration', 'Drapés, housses, table d''honneur et arche de fleurs', 'Transformez n''importe quelle salle en écrin : habillage complet des chaises, drapés plafond, table d''honneur composée, arche de fleurs pour l''entrée des mariés et chemin de table fleuri. Équipe de 6 décoratrices, montage la veille, démontage inclus. Rendez-vous de conception offert.',
  450, 'la prestation', 480, 4.9, 132,
  '/images/deco-1.jpg', ARRAY['/images/deco-1.jpg', '/images/hall-2.jpg'], 'Kinshasa', 'Limete · Atelier central',
  ARRAY['Habillage chaises', 'Drapés plafond', 'Table d''honneur', 'Arche de fleurs', 'Montage la veille', 'Maquette 3D avant'], true, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'deco-fleurs',
  (select id from public.providers where lower(name) = lower('Fleurs & Lumières') limit 1),
  'Fleurs & Lumières', 'Fleurs & Lumières — Déco extérieure', 'decoration', 'Guirlandes, luminaires et compositions florales géantes', 'Spécialistes des cérémonies en plein air : guirlandes Edison suspendues, lampes à panneaux solaires (indispensables avec les coupures !), compositions florales tropicales et photowall fleuri pour vos invités. Fonctionne aussi en salle. Bouquet de la mariée offert.',
  350, 'la prestation', 360, 4.8, 64,
  '/images/deco-2.jpg', ARRAY['/images/deco-2.jpg', '/images/garden-1.jpg'], 'Goma', 'Les Volcans',
  ARRAY['Guirlandes Edison', 'Éclairage solaire', 'Photowall fleuri', 'Bouquet mariée offert', 'Compositions tropicales'], false, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'sono-prestige',
  (select id from public.providers where lower(name) = lower('Prestige Sono') limit 1),
  'Prestige Sono', 'Prestige Sono — Son, lumières & DJ', 'sono', 'Pack complet 4000W, écran LED, DJ professionnel', 'Le pack son & lumière le plus complet de Kin : enceintes 4000W, table de mixage, 2 micros HF (pour le maire et les discours), éclairage LED paré, machine à fumée et écran LED 55 pouces pour vos projections. DJ professionnel qui mixe rumba, ndombolo, coupé-décalé et hits internationaux selon vos playlists. Groupe électrogène de secours inclus.',
  280, 'l''événement', 360, 4.9, 176,
  '/images/sono-1.jpg', ARRAY['/images/sono-1.jpg', '/images/sono-2.jpg'], 'Kinshasa', 'Kintambo · Magasin central',
  ARRAY['4000W + 2 micros HF', 'Écran LED 55"', 'Éclairage + fumée', 'DJ pro 4 langues', 'Groupe électrogène secours', 'Montage 2h avant'], true, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'sono-dj-jojo',
  (select id from public.providers where lower(name) = lower('DJ Jojo Mix') limit 1),
  'DJ Jojo Mix', 'DJ Jojo Mix — Ambiance & animation musicale', 'sono', 'DJ + sono 2000W, karaoké et jeux d''animation', 'DJ Jojo anime vos cérémonies avec énergie : sono 2000W adaptée aux salles de 100-200 invités, éclairage ambiant, micro pour les discours, et animation de jeux (lancer de bouquet, concours de danse, karaoké). Spécialiste des anniversaires et dotations. Playlist validée avec vous 48h avant.',
  180, 'l''événement', 360, 4.8, 118,
  '/images/sono-2.jpg', ARRAY['/images/sono-2.jpg'], 'Lubumbashi', 'Kenya · Quartier golf',
  ARRAY['Sono 2000W', 'Micro discours', 'Jeux d''animation', 'Playlist sur mesure', 'Éclairage ambiant'], false, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'photo-memoire',
  (select id from public.providers where lower(name) = lower('Studio Mémoire') limit 1),
  'Studio Mémoire', 'Studio Mémoire — Photo & film du jour J', 'photo', '2 photographes + 1 vidéaste, film livré en 7 jours', 'Une équipe complète pour ne rien manquer : 2 photographes (cérémonie religieuse + réception), 1 vidéaste avec drone, album photo premium 40 pages et film récap de 5 à 10 minutes livré en 7 jours sur clé USB + lien WhatsApp partageable. Séance engagement (pré-mariage) offerte.',
  300, 'la journée', 600, 4.9, 154,
  '/images/photo-1.jpg', ARRAY['/images/photo-1.jpg', '/images/photo-2.jpg'], 'Kinshasa', 'Kasa-Vubu · Studio principal',
  ARRAY['2 photographes + vidéaste', 'Vues drone', 'Album premium 40 pages', 'Film 5-10 min en 7j', 'Séance engagement offerte', 'Livraison USB + WhatsApp'], true, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'photo-nova',
  (select id from public.providers where lower(name) = lower('Cinéma Nova') limit 1),
  'Cinéma Nova', 'Cinéma Nova — Production vidéo cérémonie', 'photo', 'Film 4K, clip d''invitation et aftermovie', 'Pour les cérémonies dont on parle encore 10 ans après : tournage 4K cinéma, clip d''invitation à diffuser avant le jour J, aftermovie dynamique de 3 minutes, couverture des coulisses (préparatifs, larmes des parents, entrée des mariés). Montage pro colorimétrie cinéma.',
  500, 'la journée', 600, 4.9, 58,
  '/images/photo-2.jpg', ARRAY['/images/photo-2.jpg'], 'Kinshasa', 'Ngaliema · Plateau',
  ARRAY['Tournage 4K', 'Clip d''invitation', 'Aftermovie 3 min', 'Coulisses incluses', 'Colorimétrie cinéma'], false, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'beaute-salon-k',
  (select id from public.providers where lower(name) = lower('Salon Beauté K') limit 1),
  'Salon Beauté K', 'Salon Beauté K — Mariée & cortège', 'beaute', 'Coiffure, maquillage et ongles le jour J, à domicile', 'Le jour J, votre équipe beauté se déplace chez vous dès 5h du matin : coiffure de la mariée ( attaches, tresses, lissage au choix), maquillage longue tenue waterproof (adapté à la chaleur de Kin !), mise en beauté de 4 demoiselles d''honneur et pose d''ongles. Retouches pendant la réception incluses.',
  150, 'la mariée + cortège', 300, 4.9, 187,
  '/images/beauty-1.jpg', ARRAY['/images/beauty-1.jpg', '/images/beauty-2.jpg'], 'Kinshasa', 'Gombe · Déplacement inclus',
  ARRAY['Déplacement à domicile 5h', 'Maquillage waterproof longue tenue', '4 demoiselles d''honneur incluses', 'Tresses / attaches au choix', 'Retouches pendant la fête', 'Essai coiffure 1 semaine avant'], true, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'beaute-institut',
  (select id from public.providers where lower(name) = lower('Institut Éclat') limit 1),
  'Institut Éclat', 'Institut Éclat — Soin & mise en beauté', 'beaute', 'Soin du visage, pédicure et maquillage en institut', 'Préparez votre peau 15 jours avant avec un protocole éclat : soin du visage profond, gommage corps, pédicure-luxury et le maquillage du jour J en institut (climatisé, calme, thé offert). Idéal marraines et mamans qui veulent être resplendissantes.',
  60, 'la prestation', 180, 4.8, 92,
  '/images/beauty-2.jpg', ARRAY['/images/beauty-2.jpg'], 'Lubumbashi', 'Campus · Av. Kwilu',
  ARRAY['Protocole éclat 15 jours', 'Soin visage + gommage', 'Pédicure luxury', 'Maquillage jour J', 'Thé & détente'], false, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'mode-maison-wax',
  (select id from public.providers where lower(name) = lower('Maison Wax') limit 1),
  'Maison Wax', 'Maison Wax — Tenues de cérémonie sur mesure', 'beaute', 'Tenues couple + cortège en pagne, confection 10 jours', 'Sortez du commun : ensemble couple assorti en wax premium (london fabric), confection sur mesure en 10 jours avec 2 séances de mesure à domicile. Options cortège jusqu''à 8 personnes, doublure et accessoires (foulards, chapeaux, sacs). Retouches gratuites jusqu''au jour J.',
  220, 'le couple', 120, 4.9, 76,
  '/images/mode-1.jpg', ARRAY['/images/mode-1.jpg', '/images/mode-2.jpg'], 'Kinshasa', 'Matonge · Galerie Wakamera',
  ARRAY['Wax premium london', 'Mesures à domicile', 'Cortège jusqu''à 8 pers.', 'Accessoires assortis', 'Retouches gratuites', 'Livraison 10 jours'], true, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'transport-prestige',
  (select id from public.providers where lower(name) = lower('Cortège Prestige') limit 1),
  'Cortège Prestige', 'Cortège Prestige — Voiture des mariés décorée', 'transport', 'Berline de luxe fleurie + chauffeur en gants blancs', 'Arrivez comme des stars : berline de luxe décorée avec fleurs fraîches et rubans satin, chauffeur en costume et gants blancs, parcours personnalisé (mairie → église → réception). Décoration de 2 voitures d''accompagnement incluse. Boissons fraîches et champagne de bienvenue à bord.',
  150, 'la journée', 480, 4.8, 103,
  '/images/car-1.jpg', ARRAY['/images/car-1.jpg', '/images/car-2.jpg'], 'Kinshasa', 'Kintambo · Base flotte',
  ARRAY['Fleurs fraîches + rubans', 'Chauffeur gants blancs', '2 voitures d''accompagnement', 'Parcours personnalisé', 'Champagne à bord', 'Carburant inclus'], false, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'transport-convoy',
  (select id from public.providers where lower(name) = lower('Convoy Express') limit 1),
  'Convoy Express', 'Convoy Express — Bus invités & famille', 'transport', 'Bus 70 places + minibus VIP, navettes assurées', 'Ne laissez aucun invité au bord de la route : bus de 70 places pour la famille, minibus VIP 15 places climatisé pour les parents des mariés, navettes gérées par un coordinateur (point de ramassage unique ou double). Chauffeurs expérimentés du trafic kinois, plan de passage préparé avec vous.',
  200, 'la journée', 600, 4.7, 47,
  '/images/car-2.jpg', ARRAY['/images/car-2.jpg'], 'Kinshasa', 'Ndjili · Dépôt',
  ARRAY['Bus 70 places', 'Minibus VIP climatisé', 'Coordinateur navettes', 'Plan de passage', 'Carburant inclus'], false, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'animation-orchestre',
  (select id from public.providers where lower(name) = lower('Kin Vibes') limit 1),
  'Kin Vibes', 'Orchestre Kin Vibes — Rumba & ndombolo live', 'animation', '8 musiciens live, 3 sets de 45 min, animations danse', 'L''orchestre qui met feu à toutes les cérémonies : 8 musiciens (chants, guitares mi-solo, briquette, cuivres, percussions), 3 sets live de 45 minutes, rumba pour les parents et ndombolo enflammé pour finir. Animation de l''entrée des mariés, sebene face-à-face et dédicaces chantées avec vos noms.',
  500, 'la prestation', 300, 4.9, 89,
  '/images/band-1.jpg', ARRAY['/images/band-1.jpg'], 'Kinshasa', 'Matonge · Local répétitions',
  ARRAY['8 musiciens live', '3 sets de 45 min', 'Dédicaces chantées', 'Entrée des mariés animée', 'Sono pro incluse', 'Répétition demandes spéciales'], true, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'animation-chorale',
  (select id from public.providers where lower(name) = lower('Étoile du Soir') limit 1),
  'Étoile du Soir', 'Chorale Étoile du Soir — Gospel & louange', 'animation', 'Chorale 15 voix pour cérémonie religieuse & réception', 'Une chorale de 15 voix pour sublimer vos cérémonies religieuses : louange d''entrée, chants spéciaux pendant l''alliance, et reprise gospel festive à la réception. Répertoire sur mesure (vos chants préférés), micros et directeur de chœur inclus. Répète avec vous une fois avant le jour J.',
  200, 'la prestation', 240, 5, 71,
  '/images/choir-1.jpg', ARRAY['/images/choir-1.jpg', '/images/trad-1.jpg'], 'Bukavu', 'Ibanda · Cathédrale',
  ARRAY['15 choristes', 'Répertoire sur mesure', 'Chants spéciaux alliance', 'Micros inclus', 'Répétition incluse'], false, false,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'animation-enfants',
  (select id from public.providers where lower(name) = lower('Rire & Ballons') limit 1),
  'Rire & Ballons', 'Rire & Ballons — Animation enfants', 'animation', 'Château gonflable, jeux, maquillage et goûter', 'Vos petits invités ne s''ennuieront plus : château gonflable, animateurs diplômés (2), atelier maquillage bébé, jeux de vitesse, danse des gagnants et mini-goûter (jus + biscuits). Idéal anniversaires, doto et baptêmes. Sécurité : zone clôturée + animateur dédié par tranche de 10 enfants.',
  120, 'l''après-midi', 240, 4.9, 134,
  '/images/kids-1.jpg', ARRAY['/images/kids-1.jpg', '/images/kids-2.jpg'], 'Goma', 'Katindo · Déplacement 15 km',
  ARRAY['Château gonflable', '2 animateurs diplômés', 'Maquillage enfants', 'Mini-goûter inclus', '1 animateur / 10 enfants'], false, true,
  false, false, 'approved'
) on conflict (id) do nothing;
insert into public.services (
  id, provider_id, provider_name, name, category, description, long_description,
  price, price_unit, duration, rating, reviews, image, images, city, location,
  features, popular, instant, paused, is_custom, admin_approval_status
) values (
  'gateau-douceurs',
  (select id from public.providers where lower(name) = lower('Douceurs de Kin') limit 1),
  'Douceurs de Kin', 'Douceurs de Kin — Wedding cake sur mesure', 'gateau', '3 étages, design personnalisé, livraison le jour J', 'Le gâteau qui fait tourner les têtes : 3 étages personnalisés (couleurs de votre déco, prénoms des mariés, fleurs sucrées), génoise moelleuse garniture au choix (chocolat, vanille-frangipane, ananas-coco). Servi avec coupe cérémoniale et couteau doré. Livraison et montage sur place le jour J.',
  120, 'le gâteau 3 étages', 60, 4.9, 158,
  '/images/kids-2.jpg', ARRAY['/images/kids-2.jpg', '/images/kids-1.jpg'], 'Kinshasa', 'Lemba · Avenue de la Libération',
  ARRAY['3 étages personnalisés', 'Fleurs sucrées', 'Coupe cérémoniale incluse', 'Livraison & montage', 'Dégustation offerte', 'Mini-gâteaux invités en option'], true, true,
  false, false, 'approved'
) on conflict (id) do nothing;

commit;

-- Contrôle : doit afficher 6 prestataires approuvés / 20 prestations approuvées
select
  (select count(*) from public.providers where status = 'approved') as prestataires_approuves,
  (select count(*) from public.services where admin_approval_status = 'approved') as prestations_approuvees;
