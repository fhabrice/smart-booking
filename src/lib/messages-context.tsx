"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { ChatMessage } from "./types"
import { api } from "./api"
import { useProviderSpace } from "./provider-context"
import { useAdmin } from "./admin-context"

/**
 * Messagerie (client ↔ prestataire ↔ admin) — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Tous les messages sont stockés en base (table `messages`) et chargés via
 * /api/messages. Aucun message de démonstration n'existe dans le code.
 *
 * Fils de discussion :
 *   • `admin-<Prestataire>`      → assistance prestataire ↔ admin
 *   • `cp-<Prestataire>-<tél.>`  → conversation client ↔ prestataire
 *
 * Le navigateur d'un visiteur retient uniquement les identifiants de SES fils
 * (créés depuis cet appareil) ; le contenu est toujours relu en base.
 */

const DEVICE_THREADS_KEY = "sb-rdc-thread-ids"

function readThreadIds(): string[] {
  try {
    const raw = localStorage.getItem(DEVICE_THREADS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : []
  } catch {
    return []
  }
}

function rememberThreadId(threadId: string) {
  try {
    const ids = readThreadIds()
    if (!ids.includes(threadId)) {
      localStorage.setItem(DEVICE_THREADS_KEY, JSON.stringify([threadId, ...ids].slice(0, 50)))
    }
  } catch {}
}

type MessagesContextType = {
  messages: ChatMessage[]
  mounted: boolean
  dataError: string | null
  sendMessage: (data: Omit<ChatMessage, "id" | "createdAt">) => Promise<ChatMessage>
  getThreadMessages: (threadId: string) => ChatMessage[]
  getProviderAdminThread: (providerName: string) => ChatMessage[]
  getClientProviderThread: (providerName: string, clientIdentifier: string) => ChatMessage[]
  getAllAdminThreads: () => Array<{
    threadId: string
    providerName: string
    lastMessage: ChatMessage
    count: number
  }>
  markThreadRead: (threadId: string, asRole?: "client" | "provider" | "admin") => Promise<void>
  reload: () => Promise<void>
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const { session } = useProviderSpace()
  const { isAdmin } = useAdmin()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [mounted, setMounted] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const deviceThreads = useRef<string[]>([])

  const load = useCallback(async () => {
    const byId = new Map<string, ChatMessage>()
    if (isAdmin) {
      const all = await api.get<ChatMessage[]>("/api/messages?scope=admin")
      all.forEach((m) => byId.set(m.id, m))
    } else if (session) {
      const own = await api.get<ChatMessage[]>(`/api/messages?provider=${encodeURIComponent(session)}`)
      own.forEach((m) => byId.set(m.id, m))
    }
    if (deviceThreads.current.length > 0) {
      const mine = await api.get<ChatMessage[]>(
        `/api/messages?threads=${encodeURIComponent(deviceThreads.current.join(","))}`
      )
      mine.forEach((m) => byId.set(m.id, m))
    }
    setMessages(Array.from(byId.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
  }, [isAdmin, session])

  useEffect(() => {
    deviceThreads.current = readThreadIds()
    let cancelled = false
    ;(async () => {
      setDataError(null)
      try {
        await load()
      } catch (err) {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : "Erreur de chargement des messages.")
        }
      } finally {
        if (!cancelled) setMounted(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  const sendMessage = useCallback(async (data: Omit<ChatMessage, "id" | "createdAt">): Promise<ChatMessage> => {
    const message = await api.post<ChatMessage>("/api/messages", data)
    setMessages((prev) => [...prev.filter((m) => m.id !== message.id), message])
    if (message.fromRole === "client") rememberThreadId(message.threadId)
    return message
  }, [])

  const getThreadMessages = useCallback(
    (threadId: string): ChatMessage[] => {
      return messages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    },
    [messages]
  )

  const getProviderAdminThread = useCallback(
    (providerName: string): ChatMessage[] => getThreadMessages(`admin-${providerName}`),
    [getThreadMessages]
  )

  const getClientProviderThread = useCallback(
    (providerName: string, clientIdentifier: string): ChatMessage[] => {
      return getThreadMessages(`cp-${providerName}-${clientIdentifier}`)
    },
    [getThreadMessages]
  )

  const getAllAdminThreads = useCallback(() => {
    const threadMap = new Map<string, { threadId: string; providerName: string; messages: ChatMessage[] }>()

    for (const msg of messages) {
      if (msg.threadId.startsWith("admin-")) {
        const providerName = msg.threadId.replace("admin-", "")
        if (!threadMap.has(msg.threadId)) {
          threadMap.set(msg.threadId, { threadId: msg.threadId, providerName, messages: [] })
        }
        threadMap.get(msg.threadId)!.messages.push(msg)
      }
    }

    const result: Array<{ threadId: string; providerName: string; lastMessage: ChatMessage; count: number }> = []
    threadMap.forEach((val) => {
      const sorted = val.messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const lastMessage = sorted[sorted.length - 1]
      result.push({ threadId: val.threadId, providerName: val.providerName, lastMessage, count: sorted.length })
    })

    return result.sort((a, b) => b.lastMessage.createdAt.localeCompare(a.lastMessage.createdAt))
  }, [messages])

  const markThreadRead = useCallback(
    async (threadId: string, asRole?: "client" | "provider" | "admin") => {
      await api.post("/api/messages/read", { threadId, toRole: asRole })
      setMessages((prev) =>
        prev.map((m) =>
          m.threadId === threadId && (!asRole || m.toRole === asRole) ? { ...m, read: true } : m
        )
      )
    },
    []
  )

  return (
    <MessagesContext.Provider
      value={{
        messages,
        mounted,
        dataError,
        sendMessage,
        getThreadMessages,
        getProviderAdminThread,
        getClientProviderThread,
        getAllAdminThreads,
        markThreadRead,
        reload: load,
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
