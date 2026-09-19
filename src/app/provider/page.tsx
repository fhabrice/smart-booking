"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProviderSpace } from "@/lib/provider-context"
import { categories, cities } from "@/lib/data"
import {
  BadgeCheck,
  Star,
  MapPin,
  Briefcase,
  CalendarCheck,
  ShieldCheck,
  Wallet,
  ArrowRight,
  Check,
  UserPlus,
  LogIn,
  AlertCircle,
  Phone,
  Mail,
  Building,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProviderLoginPage() {
  const router = useRouter()
  const { session, mounted, login, registerProvider, accounts } = useProviderSpace()

  const [activeTab, setActiveTab] = useState<"register" | "login">("register")

  // Formulaire d'inscription
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [phone, setPhone] = useState("+243 ")
  const [whatsapp, setWhatsapp] = useState("+243 ")
  const [email, setEmail] = useState("")
  const [city, setCity] = useState("Kinshasa")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("salles")
  const [experience, setExperience] = useState("3 ans d'expérience")
  const [rccm, setRccm] = useState("")
  const [bio, setBio] = useState("")
  const [regError, setRegError] = useState("")

  // Formulaire de connexion
  const [loginSearch, setLoginSearch] = useState("")

  useEffect(() => {
    if (mounted && session) router.replace("/provider/dashboard")
  }, [mounted, session, router])

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setRegError("Veuillez indiquer le nom commercial ou de votre entreprise.")
    if (!contactPerson.trim()) return setRegError("Veuillez indiquer le nom du responsable.")
    if (phone.trim().length < 8) return setRegError("Veuillez saisir un numéro de téléphone valide.")

    // Vérifier si le nom existe déjà
    const exists = accounts.some((a) => a.name.toLowerCase() === name.trim().toLowerCase())
    if (exists) {
      return setRegError("Un compte avec ce nom d'établissement existe déjà. Veuillez vous connecter.")
    }

    registerProvider({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, "")}@example.cd`,
      city,
      location: location.trim() || "Centre-ville",
      category,
      experience: experience.trim() || "3 ans d'expérience",
      bio: bio.trim() || `Prestataire professionnel ${category} basé à ${city}.`,
      rccm: rccm.trim(),
      status: "pending",
      verified: false,
    })

    router.push("/provider/dashboard")
  }

  const handleSelectLogin = (providerName: string) => {
    login(providerName)
    router.push("/provider/dashboard")
  }

  const filteredAccounts = accounts.filter(
    (a) =>
      !loginSearch ||
      a.name.toLowerCase().includes(loginSearch.toLowerCase()) ||
      a.city.toLowerCase().includes(loginSearch.toLowerCase()) ||
      a.contactPerson.toLowerCase().includes(loginSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-zinc-900 py-12 text-white dark:bg-zinc-800 sm:py-16">
        <div className="absolute inset-0 -z-0 opacity-20">
          <img src="/images/band-1.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
              <Briefcase className="h-3.5 w-3.5" /> Espace Partenaires & Prestataires RDC
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Développez votre activité avec{" "}
              <span className="bg-gradient-to-r from-amber-300 to-red-300 bg-clip-text text-transparent">
                Smart Booking
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Inscrivez votre établissement, soumettez vos prestations à notre équipe de modération, créez des affiches promotionnelles percutantes et encaissez vos acomptes en Mobile Money.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
              {[
                {
                  icon: CalendarCheck,
                  title: "Des réservations 7j/7",
                  desc: "Votre vitrine visible par les familles et organisateurs de mariages, dots et réceptions.",
                },
                {
                  icon: Wallet,
                  title: "Acomptes garantis",
                  desc: "Acompte de 50% encaissé en Mobile Money (M-Pesa, Orange, Airtel) avant la date.",
                },
                {
                  icon: ShieldCheck,
                  title: "Validation & Confiance",
                  desc: "Validation par nos modérateurs pour certifier le sérieux de chaque professionnel.",
                },
              ].map((benefit) => (
                <div key={benefit.title} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500">
                    <benefit.icon className="h-4 w-4" />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{benefit.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interface Inscription / Connexion */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Onglets */}
        <div className="flex justify-center mb-8">
          <div className="flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setActiveTab("register")}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                activeTab === "register"
                  ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <UserPlus className="h-4 w-4" /> 1. S&apos;inscrire comme prestataire
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                activeTab === "login"
                  ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-black"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <LogIn className="h-4 w-4" /> 2. Se connecter
            </button>
          </div>
        </div>

        {/* TAB 1 : INSCRIPTION PRESTATAIRE */}
        {activeTab === "register" && (
          <div className="rounded-[32px] border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-center max-w-lg mx-auto mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                📝 Inscription Gratuite
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">Créer mon compte prestataire</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Remplissez ce formulaire pour créer votre espace professionnel. Vous pourrez dès à présent créer vos prestations, faire vos affiches et communiquer avec l&apos;administrateur.
              </p>
            </div>

            {regError && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Nom de l&apos;entreprise / Établissement *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex : Safari Palace, Déco Prestige Goma…"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Nom complet du responsable *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Ex : Trésor Mutombo"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Téléphone d&apos;appel *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+243 8xx xxx xxx"
                      type="tel"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Numéro WhatsApp Pro
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+243 8xx xxx xxx"
                      type="tel"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Adresse Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@monentreprise.cd"
                      type="email"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Ville principale *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Commune / Quartier *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex : Gombe, Himbi, Golf…"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Activité principale *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {categories.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Années d&apos;expérience
                  </label>
                  <input
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Ex : 5 ans d'expérience"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    N° RCCM ou Id. Nationale (Optionnel)
                  </label>
                  <input
                    value={rccm}
                    onChange={(e) => setRccm(e.target.value)}
                    placeholder="Ex : CD/KIN/RCCM/22-B-0987"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Présentation de votre activité & services
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Décrivez vos points forts, capacité d'accueil, matériel, formules de mariage ou de cérémonie…"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                  <ShieldCheck className="h-4 w-4" /> Processus de vérification administrative :
                </div>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  Votre dossier sera transmis aux administrateurs Smart Booking RDC pour validation de conformité. Vos nouvelles prestations publiées passeront également par l&apos;approbation admin avant mise en vitrine.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 font-bold"
              >
                <Check className="h-4 w-4" /> Valider mon inscription & Accéder à mon espace
              </Button>
            </form>
          </div>
        )}

        {/* TAB 2 : CONNEXION PRESTATAIRE EXISTANT */}
        {activeTab === "login" && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                🔐 Connexion Espace Prestataire
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">Accédez à votre compte</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Sélectionnez votre compte dans la liste ci-dessous pour gérer vos prestations, consulter vos demandes, faire vos affiches et voir vos rapports.
              </p>
            </div>

            <div className="relative max-w-md mx-auto">
              <input
                value={loginSearch}
                onChange={(e) => setLoginSearch(e.target.value)}
                placeholder="Rechercher par nom de prestataire ou ville…"
                className="w-full rounded-full border border-zinc-200 bg-white py-2.5 px-4 text-xs font-medium focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAccounts.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleSelectLogin(provider.name)}
                  className="group flex items-center gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-base font-bold text-white">
                    {provider.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold">{provider.name}</span>
                      {provider.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" /> {provider.city}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {provider.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px]">
                      <span
                        className={`rounded-full px-2 py-0.5 font-bold ${
                          provider.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : provider.status === "pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {provider.status === "approved"
                          ? "✓ Approuvé"
                          : provider.status === "pending"
                          ? "🟡 En attente admin"
                          : "Suspendu"}
                      </span>
                    </div>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
