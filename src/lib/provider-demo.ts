import { Booking, Service } from "./types"
import { addDays, format } from "date-fns"

export type DemoBooking = Omit<Booking, "id" | "createdAt" | "status"> & { status: Booking["status"] }

const demoCustomers = [
  { name: "Chantal Kabuya", phone: "+243 81 234 56 78" },
  { name: "Jean-Bosco Mumba", phone: "+243 82 145 78 96" },
  { name: "Esther Ilunga", phone: "+243 83 256 34 12" },
  { name: "Patrick Kalala", phone: "+243 84 963 25 41" },
  { name: "Grâce Nsimba", phone: "+243 85 341 87 29" },
  { name: "Divine Tshiala", phone: "+243 89 524 63 18" },
  { name: "Serge Bofenda", phone: "+243 80 452 96 73" },
  { name: "Maman Blandine", phone: "+243 81 745 21 69" },
  { name: "Nathy Kabongo", phone: "+243 99 152 84 70" },
  { name: "Fabrice Lutumba", phone: "+243 90 658 47 32" },
  { name: "Miriam Kasongo", phone: "+243 82 517 39 04" },
  { name: "Didier Ngoy", phone: "+243 97 341 62 85" },
]

const paymentCycle = ["M-Pesa", "Orange Money", "Airtel Money"]
const timeCycle = ["09:00", "11:00", "14:00", "16:00", "18:00", "13:00", "10:00"]

/**
 * Génère un historique de réservations de démonstration pour les prestations
 * d'un prestataire : prestations passées terminées, à venir confirmées,
 * demandes en attente et une annulation — étalées sur les 5 derniers mois.
 */
export function buildDemoBookings(providerServices: Service[]): DemoBooking[] {
  const bookings: DemoBooking[] = []
  // Répartitions : [décalage en jours, statut]
  const plan: Array<[number, Booking["status"]]> = [
    [-150, "completed"],
    [-122, "completed"],
    [-95, "completed"],
    [-64, "completed"],
    [-38, "completed"],
    [-21, "cancelled"],
    [-12, "completed"],
    [+3, "pending"],
    [+9, "pending"],
    [+5, "confirmed"],
    [+17, "confirmed"],
    [+28, "confirmed"],
  ]

  providerServices.forEach((service, sIdx) => {
    plan.forEach(([offset, status], i) => {
      const customer = demoCustomers[(i + sIdx * 3) % demoCustomers.length]
      const guests = 80 + ((i * 37 + sIdx * 53) % 170)
      const price = service.priceUnit.includes("invité") ? service.price * guests : service.price
      bookings.push({
        eventId: undefined,
        serviceId: service.id,
        serviceName: service.name,
        serviceImage: service.image,
        serviceCategory: service.category,
        date: format(addDays(new Date(), offset), "yyyy-MM-dd"),
        time: timeCycle[(i + sIdx) % timeCycle.length],
        duration: service.duration,
        price,
        deposit: Math.round(price * 0.5),
        paymentMethod: paymentCycle[(i + sIdx) % paymentCycle.length],
        status,
        customerName: customer.name,
        customerPhone: customer.phone,
        providerName: service.provider.name,
        location: service.location,
        city: service.city,
      })
    })
  })

  return bookings
}
