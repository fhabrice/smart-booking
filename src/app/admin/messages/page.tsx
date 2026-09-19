"use client"

import { useState } from "react"
import { useMessages } from "@/lib/messages-context"
import { Button } from "@/components/ui/button"
import { Send, Headphones } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function AdminMessagesPage() {
  const { getAllAdminThreads, getThreadMessages, sendMessage } = useMessages()

  const adminThreads = getAllAdminThreads()
  const [activeThreadId, setActiveThreadId] = useState<string>(
    adminThreads[0]?.threadId || "admin-Grand Salon Kin"
  )
  const [replyText, setReplyText] = useState("")

  const currentThread =
    adminThreads.find((t) => t.threadId === activeThreadId) || adminThreads[0]
  const threadMessages = currentThread ? getThreadMessages(currentThread.threadId) : []

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !currentThread) return

    sendMessage({
      threadId: currentThread.threadId,
      fromRole: "admin",
      fromName: "Smart Booking Admin",
      toRole: "provider",
      toName: currentThread.providerName,
      content: replyText.trim(),
    })

    setReplyText("")
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Headphones className="h-3.5 w-3.5" /> Centre de Support & Modération
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Messagerie Prestataires</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Répondez aux demandes des prestataires (questions techniques, validation de comptes, retraits Mobile Money).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr] rounded-[28px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[550px]">
        {/* Liste des prestataires ayant écrit */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">
            Discussions actives ({adminThreads.length})
          </div>

          {adminThreads.length === 0 ? (
            <div className="text-center p-6 text-xs text-zinc-500">
              Aucun message de prestataire reçu pour le moment.
            </div>
          ) : (
            adminThreads.map((t) => (
              <button
                key={t.threadId}
                onClick={() => setActiveThreadId(t.threadId)}
                className={`w-full text-left rounded-2xl p-3 text-xs transition-all ${
                  activeThreadId === t.threadId
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="truncate">{t.providerName}</span>
                  <span className="text-[10px] opacity-60">
                    {format(new Date(t.lastMessage.createdAt), "d MMM", { locale: fr })}
                  </span>
                </div>
                <div className="truncate mt-1 opacity-80 text-[11px]">{t.lastMessage.content}</div>
              </button>
            ))
          )}
        </div>

        {/* Fil de discussion actif */}
        <div className="flex flex-col justify-between p-6">
          {currentThread ? (
            <>
              {/* En-tête */}
              <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span>{currentThread.providerName}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Prestataire Partenaire
                    </span>
                  </h3>
                  <div className="text-xs text-zinc-500">Fil d&apos;assistance administrateur</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 py-6 pr-2 max-h-[380px]">
                {threadMessages.map((m) => {
                  const isAdmin = m.fromRole === "admin"
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm ${
                          isAdmin
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm"
                            : "bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-75 mb-1">{m.fromName}</div>
                        <div>{m.content}</div>
                      </div>
                      <span className="mt-1 text-[10px] text-zinc-400">
                        {format(new Date(m.createdAt), "d MMM à HH:mm", { locale: fr })}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Champ réponse */}
              <form onSubmit={handleSendReply} className="border-t border-zinc-100 pt-4 dark:border-zinc-800 flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Répondre à ${currentThread.providerName} en tant qu'administrateur…`}
                  className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
                <Button type="submit" size="sm" className="gap-1 bg-zinc-900 text-white dark:bg-white dark:text-black">
                  <Send className="h-4 w-4" /> Répondre
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-zinc-400">
              Sélectionnez une discussion pour afficher les messages.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
