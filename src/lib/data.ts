import { Service, Category } from "./types"

export const categories: Category[] = [
  { id: "all", name: "Tous", icon: "✨", count: 12 },
  { id: "beaute", name: "Beauté", icon: "💅", count: 4 },
  { id: "bien-etre", name: "Bien-être", icon: "🧘", count: 3 },
  { id: "business", name: "Business", icon: "💼", count: 3 },
  { id: "coaching", name: "Coaching", icon: "🎯", count: 2 },
]

export const services: Service[] = [
  {
    id: "1",
    name: "Coiffure Premium & Brushing",
    category: "beaute",
    description: "Coupe tendance + soin profond + brushing pro",
    longDescription: "Offrez-vous une expérience coiffure haut de gamme avec nos experts. Diagnostic personnalisé, coupe adaptée à votre morphologie, soin profond aux huiles précieuses et brushing longue tenue. Produits Kérastase inclus.",
    duration: 90,
    price: 75,
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Sophie Laurent",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "12 ans d'expérience"
    },
    location: "Paris 8e - Champs-Élysées",
    features: ["Produits bio", "Diagnostic offert", "Boisson incluse", "Retouche gratuite"],
    popular: true,
    instant: true
  },
  {
    id: "2",
    name: "Massage Suédois Relaxant",
    category: "bien-etre",
    description: "60 min d'évasion totale, huiles chaudes",
    longDescription: "Massage profond qui libère les tensions musculaires et apaise l'esprit. Techniques suédoises et californiennes, huiles essentielles bio chauffées, ambiance zen avec chromothérapie.",
    duration: 60,
    price: 85,
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Zen Spa Paris",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Spa 5 étoiles"
    },
    location: "Paris 16e - Victor Hugo",
    features: ["Huiles bio", "Douche sensorielle", "Thé détox", "Accès hammam 30min"],
    popular: true,
    instant: true
  },
  {
    id: "3",
    name: "Salle de Réunion Connectée",
    category: "business",
    description: "Espace 8 pers, 4K, tableau interactif",
    longDescription: "Salle premium pour vos réunions stratégiques. Écran 85\" 4K, système visio Logitech Rally, tableau blanc interactif, fibre 1Gb, service conciergerie.",
    duration: 120,
    price: 120,
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "WorkNest",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Espaces premium"
    },
    location: "La Défense - Grande Arche",
    features: ["Visio 4K", "Catering", "Parking", "Accueil client"],
    instant: true
  },
  {
    id: "4",
    name: "Coaching Business 1:1",
    category: "coaching",
    description: "Stratégie & mindset avec CEO certifié",
    longDescription: "Session intensive pour débloquer votre croissance. Ex-CEO scale-up licorne, certifié HEC. Audit business, plan d'action 90 jours, suivi WhatsApp 7 jours.",
    duration: 90,
    price: 250,
    rating: 5.0,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Alexandre Dubois",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Ex-CEO, 15 ans"
    },
    location: "Visio ou Paris 1er",
    features: ["Replay", "Workbook", "Suivi 7j", "Réseau fondateurs"],
    popular: true
  },
  {
    id: "5",
    name: "Manucure Russe & Nail Art",
    category: "beaute",
    description: "Technique russe, tenue 4 semaines",
    longDescription: "La manucure russe la plus précise de Paris. Coupe cuticules à la ponceuse, renforcement, nail art minimaliste tendance. Vernis semi-permanent haut de gamme.",
    duration: 75,
    price: 65,
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Nail Atelier",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Top 3 Paris"
    },
    location: "Le Marais - Paris 3e",
    features: ["Design inclus", "Renforcement", "Massage mains", "Café de spécialité"],
    instant: true
  },
  {
    id: "6",
    name: "Yoga Privé & Breathwork",
    category: "bien-etre",
    description: "Cours sur-mesure, rooftop avec vue",
    longDescription: "Séance privée adaptée à votre niveau. Vinyasa, Hatha ou Yin, combiné à des techniques de breathwork et méditation. Sur rooftop secret avec vue Tour Eiffel.",
    duration: 60,
    price: 95,
    rating: 5.0,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Léa Martin",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "RYT 500, 8 ans"
    },
    location: "Paris 7e - Rooftop secret",
    features: ["Tapis fourni", "Thé matcha", "Playlist perso", "Photos souvenir"],
    popular: true
  },
  {
    id: "7",
    name: "Bureau Privé Jour",
    category: "business",
    description: "Focus total, vue Seine, café illimité",
    longDescription: "Votre bureau privé pour la journée. Design par architecte, lumière naturelle, vue Seine, café de spécialité illimité, appels en cabine insonorisée.",
    duration: 480,
    price: 90,
    rating: 4.8,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1497366811353-26cc3c4fa6fa?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1497366811353-26cc3c4fa6fa?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Seine Work Club",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Membre Soho House"
    },
    location: "Paris 7e - Quai Branly",
    features: ["Café illimité", "Cabine appel", "Imprimante", "Terrasse"],
    instant: true
  },
  {
    id: "8",
    name: "Coaching Carrière Express",
    category: "coaching",
    description: "CV, LinkedIn, entretien en 90min",
    longDescription: "Boostez votre carrière en une session. Refonte CV ATS-friendly, optimisation LinkedIn, simulation entretien avec feedbacks, liste recruteurs ciblés.",
    duration: 90,
    price: 180,
    rating: 4.9,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Clara Bernard",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Ex-Google Recruiter"
    },
    location: "Visio - Disponible 7j/7",
    features: ["CV refait", "LinkedIn", "Mock interview", "Liste recruteurs"],
    instant: true
  },
  {
    id: "9",
    name: "Soin Visage HydraGlow",
    category: "beaute",
    description: "Technologie HydraFacial + LED",
    longDescription: "Le soin le plus demandé à Paris. Nettoyage profond HydraFacial, peeling doux, infusion sérums, masque LED. Résultat glow immédiat, sans éviction sociale.",
    duration: 60,
    price: 110,
    rating: 4.9,
    reviews: 267,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed1350b?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed1350b?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Glow Clinic",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Dermatologue"
    },
    location: "Paris 8e - Saint-Honoré",
    features: ["Sans douleur", "Glow instantané", "Sérums inclus", "Diagnostic peau IA"],
    popular: true,
    instant: true
  },
  {
    id: "10",
    name: "Méditation & Sound Bath",
    category: "bien-etre",
    description: "Bols tibétains, voyage sonore 75min",
    longDescription: "Immersion sonore profonde avec bols tibétains, gongs et handpan. Libération émotionnelle, reset système nerveux. Dans crypte du 12e siècle.",
    duration: 75,
    price: 70,
    rating: 5.0,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Temple Sonore",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Maître sonothérapeute"
    },
    location: "Paris 3e - Crypte secrète",
    features: ["Bols tibétains", "Thé cérémonie", "Intégration", "Petit groupe 8 max"],
  },
  {
    id: "11",
    name: "Podcast Studio Pro",
    category: "business",
    description: "Enregistrement 4K, ingé son inclus",
    longDescription: "Studio podcast professionnel. 4 micros Shure SM7B, table Rodecaster, ingé son pour mixage live, montage inclus, diffusion directe.",
    duration: 120,
    price: 150,
    rating: 4.9,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1590602847861-f357a7c9c2e7?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1590602847861-f357a7c9c2e7?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "Sound House",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Studio pro"
    },
    location: "Bastille - Paris 11e",
    features: ["Ingé son", "Montage inclus", "Café", "Distribution"],
    instant: true
  },
  {
    id: "12",
    name: "Barbier & Rituel Homme",
    category: "beaute",
    description: "Coupe + barbe + serviette chaude",
    longDescription: "Expérience barbier old school revisitée. Coupe ciseaux, taille barbe précise, serviette chaude, massage crânien, finition à l'ancienne.",
    duration: 60,
    price: 55,
    rating: 4.9,
    reviews: 198,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=400&fit=crop"
    ],
    provider: {
      name: "L'Atelier Gentleman",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      verified: true,
      experience: "Barbier depuis 2010"
    },
    location: "Paris 9e - Martyrs",
    features: ["Serviette chaude", "Produit maison", "Whisky offert", "Conseil style"],
    instant: true
  }
]
