"use client"

import { useState } from "react"
import { useProviderSpace } from "@/lib/provider-context"
import { useMessages } from "@/lib/messages-context"
import { Button } from "@/components/ui/button"
import { Headphones, Send, Check, Phone } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function ProviderSupportPage() {
  const { session } = useProviderSpace()
  const { getProviderAdminThread, sendMessage } = useMessages()

  const providerName = session || ""
  const adminThread = getProviderAdminThread(providerName)

  const [messageText, setMessageText] = useState("")
  const [fastNotice, setFastNotice] = useState(false)

  const sendToAdmin = async (content: string) => {
    await sendMessage({
      threadId: `admin-${providerName}`,
      fromRole: "provider",
      fromName: providerName,
      toRole: "admin",
      toName: "Smart Booking Admin",
      content,
    })
    setMessageText("")
    setFastNotice(true)
    setTimeout(() => setFastNotice(false), 4000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return
    await sendToAdmin(messageText.trim()).catch(() => {})
  }

  const handleQuickRequest = (topic: string) => {
    void sendToAdmin(topic).catch(() => {})
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Headphones className="h-3.5 w-3.5" /> Support Dédié Prestataires
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Assistance & Modération Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Communiquez en direct avec l&apos;équipe d&apos;administration Smart Booking RDC pour faire valider vos prestations, poser des questions ou certifier votre compte.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Chat avec Admin */}
        <div className="flex flex-col justify-between rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 min-h-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white font-bold">
                  🛡️
                </div>
                <div>
                  <h3 className="font-bold text-sm">Équipe d&apos;Administration Smart Booking RDC</h3>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> En ligne • Réponse en moins de 15 min
                  </div>
                </div>
              </div>

              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Canal Officiel
              </span>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto space-y-4 py-6 pr-1 max-h-[360px]">
              {adminThread.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400">
                  Aucun message échangé pour l&apos;instant. Écrivez ci-dessous pour contacter l&apos;administration !
                </div>
              ) : (
                adminThread.map((msg) => {
                  const isAdmin = msg.fromRole === "admin"
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm ${
                          isAdmin
                            ? "bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-700 shadow-sm"
                            : "bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-sm"
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-75 mb-1 flex items-center gap-1">
                          {isAdmin ? "🛡️ Administration Smart Booking" : "Vous"}
                        </div>
                        <div>{msg.content}</div>
                      </div>
                      <span className="mt-1 text-[10px] text-zinc-400">
                        {format(new Date(msg.createdAt), "d MMM à HH:mm", { locale: fr })}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Formulaire message */}
          <div>
            {fastNotice && (
              <div className="mb-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4" /> Message envoyé avec succès aux administrateurs !
              </div>
            )}

            <form onSubmit={(e) => void handleSendMessage(e)} className="flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Écrivez votre message à l'administration Smart Booking…"
                className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
              <Button type="submit" size="sm" className="gap-1 bg-gradient-to-r from-amber-500 to-red-500 font-bold">
                <Send className="h-4 w-4" /> Envoyer
              </Button>
            </form>
          </div>
        </div>

        {/* Panneau latéral : Actions rapides & Direct Contact */}
        <div className="space-y-4">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-4">
            <h4 className="font-bold text-sm">Demandes Fréquentes</h4>
            <div className="space-y-2">
              <button
                onClick={() =>
                  handleQuickRequest(
                    "Bonjour l'administration, je viens de soumettre de nouvelles prestations et je souhaite solliciter une approbation rapide pour les mettre en vitrine. Merci !"
                  )
                }
                className="w-full text-left rounded-xl border border-zinc-200 p-2.5 text-xs font-medium hover:border-amber-400 hover:bg-amber-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-all"
              >
                ⚡ Demander une validation rapide de mes prestations
              </button>
              <button
                onClick={() =>
                  handleQuickRequest(
                    "Bonjour, comment se passe le virement de mes acomptes Mobile Money vers mon numéro M-Pesa / Orange Money ?"
                  )
                }
                className="w-full text-left rounded-xl border border-zinc-200 p-2.5 text-xs font-medium hover:border-amber-400 hover:bg-amber-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-all"
              >
                💰 Question sur les retraits Mobile Money
              </button>
              <button
                onClick={() =>
                  handleQuickRequest(
                    "Bonjour, nous avons des documents d'enregistrement RCCM / Id Nat à transmettre pour certifier notre établissement avec le badge vérifié."
                  )
                }
                className="w-full text-left rounded-xl border border-zinc-200 p-2.5 text-xs font-medium hover:border-amber-400 hover:bg-amber-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-all"
              >
                📜 Transmettre mes documents RCCM / Certification
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs space-y-3">
            <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-amber-600" /> Support Téléphonique & Urgences :
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Pour une assistance immédiate lors du jour J de la cérémonie :
            </p>
            <div className="font-bold font-mono text-sm text-zinc-900 dark:text-white">
              +243 976 459 970
            </div>
            <div className="text-[11px] text-zinc-500">
              Disponible 7j/7 • Kinshasa, Goma, Lubumbashi
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
