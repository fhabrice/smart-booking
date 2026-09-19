"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { ChatMessage } from "./types"
import { syncMessage } from "./supabase/sync"

const MESSAGES_KEY = "sb-rdc-messages"

const SEED_MESSAGES: ChatMessage[] = [
  // Client <-> Prestataire (Traiteur)
  {
    id: "msg-1",
    threadId: "client-traiteur-demo",
    fromRole: "client",
    fromName: "Sarah Lukusa",
    toRole: "provider",
    toName: "Saveurs du Fleuve Traiteur",
    content: "Bonjour Chef ! Pour notre mariage de 200 personnes à Gombe, prévoyez-vous une dégustation avant la confirmation définitive du menu ?",
    createdAt: "2026-09-18T10:15:00.000Z",
    bookingId: "demo-book-01",
    read: true,
  },
  {
    id: "msg-2",
    threadId: "client-traiteur-demo",
    fromRole: "provider",
    fromName: "Saveurs du Fleuve Traiteur",
    toRole: "client",
    toName: "Sarah Lukusa",
    content: "Bonjour Mme Sarah ! Absolument, une séance de dégustation pour 4 personnes (les futurs mariés + 2 témoins) est offerte avec le pack VIP. Vous pouvez passer à notre atelier à Ma Campagne ce samedi !",
    createdAt: "2026-09-18T10:28:00.000Z",
    bookingId: "demo-book-01",
    read: true,
  },
  // Prestataire <-> Admin (Validation et assistance)
  {
    id: "msg-admin-1",
    threadId: "admin-Grand Salon Kin",
    fromRole: "provider",
    fromName: "Grand Salon Kin",
    toRole: "admin",
    toName: "Smart Booking Admin",
    content: "Bonjour l'équipe ! Nous avons mis à jour nos tarifs pour la haute saison de décembre (passé à 650 USD avec groupe électrogène renforcé). Merci de vérifier notre fiche.",
    createdAt: "2026-09-17T14:00:00.000Z",
    read: true,
  },
  {
    id: "msg-admin-2",
    threadId: "admin-Grand Salon Kin",
    fromRole: "admin",
    fromName: "Smart Booking Admin",
    toRole: "provider",
    toName: "Grand Salon Kin",
    content: "Bonjour M. Makiese ! Modification validée avec succès par notre équipe de modération. Votre fiche est à jour et certifiée. Merci pour votre réactivité !",
    createdAt: "2026-09-17T14:30:00.000Z",
    read: true,
  },
  {
    id: "msg-admin-3",
    threadId: "admin-Kinshasa Sound & Light VIP",
    fromRole: "provider",
    fromName: "Kinshasa Sound & Light VIP",
    toRole: "admin",
    toName: "Smart Booking Admin",
    content: "Bonjour l'administrateur, j'ai soumis une nouvelle formule Pack DJ + Écran LED Géant. Pouvez-vous l'approuver pour la vitrine ?",
    createdAt: "2026-09-18T09:10:00.000Z",
    read: true,
  },
  {
    id: "msg-admin-4",
    threadId: "admin-Kinshasa Sound & Light VIP",
    fromRole: "admin",
    fromName: "Smart Booking Admin",
    toRole: "provider",
    toName: "Kinshasa Sound & Light VIP",
    content: "Bonjour Rodrigue ! Nous avons bien reçu la formule. C'est vérifié et approuvé : elle est maintenant disponible pour tous les clients !",
    createdAt: "2026-09-18T09:45:00.000Z",
    read: true,
  },
]

type MessagesContextType = {
  messages: ChatMessage[]
  mounted: boolean
  sendMessage: (data: Omit<ChatMessage, "id" | "createdAt">) => ChatMessage
  getThreadMessages: (threadId: string) => ChatMessage[]
  getProviderAdminThread: (providerName: string) => ChatMessage[]
  getClientProviderThread: (providerName: string, clientIdentifier: string) => ChatMessage[]
  getAllAdminThreads: () => Array<{
    threadId: string
    providerName: string
    lastMessage: ChatMessage
    count: number
  }>
  markThreadRead: (threadId: string) => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_KEY)
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved)
        // Fusionner avec SEED pour conserver les démos
        const map = new Map<string, ChatMessage>()
        SEED_MESSAGES.forEach((m) => map.set(m.id, m))
        parsed.forEach((m) => map.set(m.id, m))
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(Array.from(map.values()))
      }
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
    }
  }, [messages, mounted])

  const sendMessage = (data: Omit<ChatMessage, "id" | "createdAt">): ChatMessage => {
    const newMsg: ChatMessage = {
      ...data,
      id: `msg-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
    }
    setMessages((prev) => [...prev, newMsg])
    // Miroir Supabase (no-op si la base n'est pas configurée)
    syncMessage(newMsg)
    return newMsg
  }

  const getThreadMessages = (threadId: string): ChatMessage[] => {
    return messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  const getProviderAdminThread = (providerName: string): ChatMessage[] => {
    const threadId = `admin-${providerName}`
    return getThreadMessages(threadId)
  }

  const getClientProviderThread = (providerName: string, clientIdentifier: string): ChatMessage[] => {
    const threadId = `cp-${providerName}-${clientIdentifier}`
    const list = getThreadMessages(threadId)
    // Fallback sur le fil de démo si vide et si le prestataire correspond
    if (list.length === 0 && providerName.toLowerCase().includes("traiteur")) {
      return getThreadMessages("client-traiteur-demo")
    }
    return list
  }

  const getAllAdminThreads = () => {
    const threadMap = new Map<string, { threadId: string; providerName: string; messages: ChatMessage[] }>()

    for (const msg of messages) {
      if (msg.threadId.startsWith("admin-")) {
        const providerName = msg.threadId.replace("admin-", "")
        if (!threadMap.has(msg.threadId)) {
          threadMap.set(msg.threadId, {
            threadId: msg.threadId,
            providerName,
            messages: [],
          })
        }
        threadMap.get(msg.threadId)!.messages.push(msg)
      }
    }

    const result: Array<{ threadId: string; providerName: string; lastMessage: ChatMessage; count: number }> = []
    threadMap.forEach((val) => {
      const sorted = val.messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const lastMessage = sorted[sorted.length - 1]
      result.push({
        threadId: val.threadId,
        providerName: val.providerName,
        lastMessage,
        count: sorted.length,
      })
    })

    return result.sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt))
  }

  const markThreadRead = (threadId: string) => {
    setMessages((prev) => prev.map((m) => (m.threadId === threadId ? { ...m, read: true } : m)))
  }

  return (
    <MessagesContext.Provider
      value={{
        messages,
        mounted,
        sendMessage,
        getThreadMessages,
        getProviderAdminThread,
        getClientProviderThread,
        getAllAdminThreads,
        markThreadRead,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider")
  return ctx
}
