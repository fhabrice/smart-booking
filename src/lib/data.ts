import { Category, EventType, City, ChecklistItem } from "./types"

export const cities: City[] = [
  { id: "kinshasa", name: "Kinshasa", province: "Kinshasa" },
  { id: "lubumbashi", name: "Lubumbashi", province: "Haut-Katanga" },
  { id: "goma", name: "Goma", province: "Nord-Kivu" },
  { id: "bukavu", name: "Bukavu", province: "Sud-Kivu" },
  { id: "kisangani", name: "Kisangani", province: "Tshopo" },
  { id: "matadi", name: "Matadi", province: "Kongo-Central" },
  { id: "mbuji-mayi", name: "Mbuji-Mayi", province: "Kasaï-Oriental" },
  { id: "kananga", name: "Kananga", province: "Kasaï-Central" },
]

export const eventTypes: EventType[] = [
  { id: "mariage", label: "Mariage", icon: "💍", desc: "Cérémonie civile, religieuse & réception" },
  { id: "dotation", label: "Dotation", icon: "🤝", desc: "Dot, pré-dot & accord des familles" },
  { id: "anniversaire", label: "Anniversaire", icon: "🎂", desc: "Enfants, adultes, surprises" },
  { id: "bapteme", label: "Baptême & Doto", icon: "👶", desc: "Baptême, doto & présentation" },
  { id: "funerailles", label: "Funérailles", icon: "🕊️", desc: "Veillées, corps présent & convoi" },
  { id: "entreprise", label: "Entreprise", icon: "💼", desc: "Séminaires, lancements & soirées" },
]

export const categories: Category[] = [
  { id: "all", name: "Tous", icon: "✨", count: 20 },
  { id: "salles", name: "Salles & Espaces", icon: "🏛️", count: 3 },
  { id: "traiteur", name: "Traiteur & Boissons", icon: "🍲", count: 2 },
  { id: "decoration", name: "Décoration & Fleurs", icon: "🎀", count: 2 },
  { id: "sono", name: "Sono, DJ & Lumières", icon: "🔊", count: 2 },
  { id: "photo", name: "Photo & Vidéo", icon: "📸", count: 2 },
  { id: "beaute", name: "Beauté & Mode", icon: "💄", count: 3 },
  { id: "transport", name: "Transport & Cortège", icon: "🚗", count: 2 },
  { id: "animation", name: "Animation & Musique", icon: "🎤", count: 3 },
  { id: "gateau", name: "Gâteaux & Douceurs", icon: "🎂", count: 1 },
]

export function categoryName(id: string) {
  return categories.find((c) => c.id === id)?.name ?? id
}

export function eventTypeOf(id: string) {
  return eventTypes.find((e) => e.id === id)
}

/** Checklist recommandée par type de cérémonie */
export const eventChecklists: Record<string, ChecklistItem[]> = {
  mariage: [
    { category: "salles", label: "Salle ou espace de réception" },
    { category: "traiteur", label: "Repas & boissons des invités" },
    { category: "decoration", label: "Décoration de la salle & des chaises" },
    { category: "sono", label: "Sono, DJ & éclairage" },
    { category: "photo", label: "Photographe & vidéaste" },
    { category: "beaute", label: "Coiffure, maquillage & tenues" },
    { category: "transport", label: "Voiture des mariés & cortège" },
    { category: "animation", label: "Orchestre, chorale ou MC" },
    { category: "gateau", label: "Le wedding cake" },
  ],
  dotation: [
    { category: "salles", label: "Terrain ou salle de la dot" },
    { category: "traiteur", label: "Repas des deux familles" },
    { category: "decoration", label: "Décoration & paquets cadeaux" },
    { category: "beaute", label: "Tenues traditionnelles & beauté" },
    { category: "photo", label: "Photographe pour la cérémonie" },
    { category: "sono", label: "Sono pour l'ambiance" },
    { category: "transport", label: "Transport des familles" },
  ],
  anniversaire: [
    { category: "gateau", label: "Le gâteau d'anniversaire" },
    { category: "decoration", label: "Balloons & décoration" },
    { category: "animation", label: "Animation enfants ou DJ" },
    { category: "traiteur", label: "Buffet & boissons" },
    { category: "salles", label: "Salle ou espace extérieur" },
    { category: "photo", label: "Photographe" },
  ],
  bapteme: [
    { category: "salles", label: "Salle de réception" },
    { category: "traiteur", label: "Repas de la famille" },
    { category: "decoration", label: "Décoration & fleurs" },
    { category: "photo", label: "Photographe / vidéaste" },
    { category: "gateau", label: "Gâteau de baptême" },
    { category: "animation", label: "Chorale ou animation" },
  ],
  funerailles: [
    { category: "salles", label: "Salle de deuil / parcelle" },
    { category: "sono", label: "Sonorisation de la veillée" },
    { category: "traiteur", label: "Repas des personnes en deuil" },
    { category: "transport", label: "Convoi funèbre & transport" },
    { category: "photo", label: "Couverture photo / vidéo" },
    { category: "animation", label: "Chorale & louange" },
  ],
  entreprise: [
    { category: "salles", label: "Salle de conférence / espace" },
    { category: "traiteur", label: "Cocktail & catering" },
    { category: "sono", label: "Sono & écran de projection" },
    { category: "photo", label: "Photographe officiel" },
    { category: "decoration", label: "Signalétique & décoration" },
    { category: "animation", label: "MC & animation" },
  ],
}

export function checklistFor(eventType: string): ChecklistItem[] {
  return eventChecklists[eventType] ?? eventChecklists.mariage
}

// ---------------------------------------------------------------------------
// PRESTATIONS : 100 % base de données (table `services` Supabase).
// Aucun catalogue codé en dur — le contenu initial réel est chargé via
// `seed-catalog.sql` (exécutable dans Supabase Studio → SQL Editor), puis les
// prestataires publient leurs prestations depuis leur espace (/provider).
// ---------------------------------------------------------------------------

export const paymentMethods = [
  { id: "mpesa", name: "M-Pesa", desc: "Vodacom", color: "bg-red-600", hint: "+243 8x xxx xxx" },
  { id: "orange", name: "Orange Money", desc: "Orange RDC", color: "bg-orange-500", hint: "+243 7x xxx xxx" },
  { id: "airtel", name: "Airtel Money", desc: "Airtel Congo", color: "bg-red-700", hint: "+243 9x xxx xxx" },
]
