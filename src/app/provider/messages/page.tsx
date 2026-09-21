"use client"

import { useState } from "react"
import { useProviderSpace } from "@/lib/provider-context"
import { useMessages } from "@/lib/messages-context"
import { Button } from "@/components/ui/button"
import { Send, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function ProviderMessagesPage() {
  const { session } = useProviderSpace()
  const { messages, sendMessage } = useMessages()

  const providerName = session || ""

  // Filtrer les messages où le prestataire est destinataire ou émetteur avec un client
  const clientMessages = messages.filter(
    (m) =>
      m.fromRole === "client" ||
      (m.fromRole === "provider" && m.toRole === "client" && m.fromName.toLowerCase() === providerName.toLowerCase())
  )

  // Regrouper par expéditeur client
  const threadsMap = new Map<string, typeof clientMessages>()
  clientMessages.forEach((msg) => {
    const threadKey = msg.threadId
    if (!threadsMap.has(threadKey)) threadsMap.set(threadKey, [])
    threadsMap.get(threadKey)!.push(msg)
  })

  const threadList = Array.from(threadsMap.entries()).map(([threadId, msgs]) => {
    const sorted = msgs.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const lastMsg = sorted[sorted.length - 1]
    const clientName = msgs.find((m) => m.fromRole === "client")?.fromName || "Client Organisateur"
    return {
      threadId,
      clientName,
      lastMsg,
      messages: sorted,
    }
  })

  const [activeThreadId, setActiveThreadId] = useState<string>("")
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

  const currentThread =
    threadList.find((t) => t.threadId === activeThreadId) || threadList[0]

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !currentThread || sending) return

    setSending(true)
    try {
      await sendMessage({
        threadId: currentThread.threadId,
        fromRole: "provider",
        fromName: providerName,
        toRole: "client",
        toName: currentThread.clientName,
        content: replyText.trim(),
      })
      setReplyText("")
    } finally {
      setSending(false)
    }
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <MessageCircle className="h-3.5 w-3.5" /> Communications Clients
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Messages des clients</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Échangez avec les organisateurs de cérémonies qui ont réservé vos services ou posé des questions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr] rounded-[28px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-sm min-h-[550px]">
        {/* Liste des discussions */}
        <div className="border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">
            Fils de discussion ({threadList.length})
          </div>

          {threadList.length === 0 ? (
            <div className="text-center p-6 text-xs text-zinc-500">
              Aucun message client pour l&apos;instant.
            </div>
          ) : (
            threadList.map((t) => (
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
                  <span className="truncate">{t.clientName}</span>
                  <span className="text-[10px] opacity-60">
                    {format(new Date(t.lastMsg.createdAt), "d MMM", { locale: fr })}
                  </span>
                </div>
                <div className="truncate mt-1 opacity-80 text-[11px]">{t.lastMsg.content}</div>
              </button>
            ))
          )}
        </div>

        {/* Conversation active */}
        <div className="flex flex-col justify-between p-6">
          {currentThread ? (
            <>
              {/* En-tête discussion */}
              <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{currentThread.clientName}</h3>
                  <div className="text-xs text-zinc-500">Demande d&apos;information pour cérémonie</div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Client vérifié Smart Booking
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 py-6 pr-2 max-h-[380px]">
                {currentThread.messages.map((m) => {
                  const isMe = m.fromRole === "provider"
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm ${
                          isMe
                            ? "bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-sm"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
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
              <form onSubmit={(e) => void handleSendReply(e)} className="border-t border-zinc-100 pt-4 dark:border-zinc-800 flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez votre réponse au client…"
                  className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
                <Button type="submit" size="sm" className="gap-1 bg-gradient-to-r from-amber-500 to-red-500">
                  <Send className="h-4 w-4" /> Envoyer
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
