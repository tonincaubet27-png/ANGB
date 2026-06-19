'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { getClient } from '@/lib/supabase-client'
import {
  getInboxMessages, getMessageableMembers, sendMessage, markConversationRead,
} from '@/lib/data'
import type { Message, MessageMember, Conversation } from '@/lib/types'

const initialsOf = (n: string) => n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

function Avatar({ name, photo, size = 40 }: { name: string; photo?: string; size?: number }) {
  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ width: size, height: size, background: 'rgba(74,127,255,0.18)', color: '#4a7fff' }}>
      {photo ? <Image src={photo} alt={name} width={size} height={size} className="w-full h-full object-cover" /> : initialsOf(name || '?')}
    </div>
  )
}

export default function MessagesPage() {
  const { user, profile, loading, openAuth } = useAuth()
  const isMember = profile?.membership_status === 'active'

  const [members, setMembers]   = useState<MessageMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft]       = useState('')
  const [sending, setSending]   = useState(false)
  const [picking, setPicking]   = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const memberById = useMemo(() => {
    const m: Record<string, MessageMember> = {}
    members.forEach(x => { m[x.user_id] = x })
    return m
  }, [members])

  const reloadInbox = useCallback(async () => {
    if (!user) return
    setMessages(await getInboxMessages(user.id))
  }, [user])

  // Chargement initial + abonnement temps réel
  useEffect(() => {
    if (!user || !isMember) return
    getMessageableMembers().then(setMembers)
    reloadInbox()

    const client = getClient()
    if (!client) return
    const channel = client
      .channel(`messages-${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` },
        () => { reloadInbox() })
      .subscribe()
    return () => { client.removeChannel(channel) }
  }, [user, isMember, reloadInbox])

  // Conversations agrégées (groupées par interlocuteur)
  const conversations: Conversation[] = useMemo(() => {
    if (!user) return []
    const byOther: Record<string, Message[]> = {}
    for (const msg of messages) {
      const other = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
      ;(byOther[other] ??= []).push(msg)
    }
    return Object.entries(byOther).map(([otherId, msgs]) => {
      const last = msgs[msgs.length - 1]
      const unread = msgs.filter(m => m.recipient_id === user.id && !m.read_at).length
      return {
        other: memberById[otherId] ?? { user_id: otherId, name: 'Membre ANGB' },
        lastMessage: last.content,
        lastAt: last.created_at,
        unread,
      }
    }).sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
  }, [messages, user, memberById])

  // Messages du fil actif
  const thread = useMemo(() => {
    if (!user || !activeId) return []
    return messages.filter(m =>
      (m.sender_id === user.id && m.recipient_id === activeId) ||
      (m.sender_id === activeId && m.recipient_id === user.id))
  }, [messages, user, activeId])

  const activeMember = activeId ? (memberById[activeId] ?? { user_id: activeId, name: 'Membre ANGB' }) : null

  // Ouvrir une conversation → marquer comme lue + scroller en bas
  useEffect(() => {
    if (!user || !activeId) return
    if (thread.some(m => m.recipient_id === user.id && !m.read_at)) {
      markConversationRead(user.id, activeId).then(reloadInbox)
    }
    requestAnimationFrame(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }) })
  }, [activeId, thread, user, reloadInbox])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || !user || !activeId) return
    setSending(true)
    const { ok } = await sendMessage(user.id, activeId, text)
    setSending(false)
    if (ok) { setDraft(''); await reloadInbox() }
  }

  // ── États d'accès ────────────────────────────────────────────────────────
  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-20"><div className="h-96 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} /></div>
  }
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-lg mb-4" style={{ color: 'var(--white)' }}>Connecte-toi pour accéder à ta messagerie</p>
        <button onClick={() => openAuth('login')} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>Se connecter</button>
      </div>
    )
  }
  if (!isMember) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-lg mb-2" style={{ color: 'var(--white)' }}>Messagerie réservée aux membres</p>
        <p className="text-sm" style={{ color: 'var(--gray)' }}>Ton adhésion doit être validée par le bureau pour échanger avec les autres gardiens.</p>
      </div>
    )
  }

  const otherMembers = members.filter(m => m.user_id !== user.id)

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-4xl md:text-5xl mb-1" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>Messagerie</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--gray)' }}>Échange en privé avec les autres membres, dans le respect de la charte.</p>

      <div className="grid md:grid-cols-[300px_1fr] gap-4 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', minHeight: 560 }}>

        {/* ── Liste des conversations ─────────────────────────────────── */}
        <div className="flex flex-col" style={{ background: 'var(--navy-mid)', borderRight: '1px solid var(--border)' }}>
          <div className="p-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setPicking(p => !p)}
              className="w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-white"
              style={{ background: 'var(--accent)' }}>
              + Nouveau message
            </button>
            {picking && (
              <select autoFocus value="" onChange={e => { if (e.target.value) { setActiveId(e.target.value); setPicking(false) } }}
                className="w-full mt-2 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--border)' }}>
                <option value="">Choisir un membre…</option>
                {otherMembers.map(m => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
              </select>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-xs text-center mt-8 px-4" style={{ color: 'var(--gray)' }}>Aucune conversation. Démarre avec « Nouveau message ».</p>
            ) : conversations.map(c => (
              <button key={c.other.user_id} onClick={() => setActiveId(c.other.user_id)}
                className="w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-white/5"
                style={{ background: activeId === c.other.user_id ? 'rgba(74,127,255,0.1)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                <Avatar name={c.other.name} photo={c.other.photo_url} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--white)' }}>{c.other.name}</span>
                    {c.unread > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: '#ED2939' }}>{c.unread}</span>}
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--gray)' }}>{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Fil de discussion ───────────────────────────────────────── */}
        <div className="flex flex-col" style={{ background: 'var(--navy)' }}>
          {!activeMember ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--gray)' }}>Sélectionne ou démarre une conversation 💬</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--navy-mid)' }}>
                <Avatar name={activeMember.name} photo={activeMember.photo_url} size={36} />
                <span className="text-sm font-bold" style={{ color: 'var(--white)' }}>{activeMember.name}</span>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 440 }}>
                {thread.map(m => {
                  const mine = m.sender_id === user.id
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
                        style={{
                          background: mine ? 'rgba(16,108,80,0.42)' : 'var(--navy-mid)',
                          color: 'var(--white)',
                          borderBottomRightRadius: mine ? 4 : 16,
                          borderBottomLeftRadius: mine ? 16 : 4,
                        }}>
                        <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.content}</p>
                        <p className="text-[10px] mt-1 text-right" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {thread.length === 0 && <p className="text-xs text-center mt-8" style={{ color: 'var(--gray)' }}>Aucun message. Écris le premier !</p>}
              </div>

              <div className="p-3 flex items-end gap-2 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--navy-mid)' }}>
                <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={1}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Écris un message…"
                  className="flex-1 px-3.5 py-2.5 rounded-2xl text-sm outline-none resize-none"
                  style={{ background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--border)', maxHeight: 120 }} />
                <button onClick={handleSend} disabled={sending || !draft.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50"
                  style={{ background: '#25D366' }} aria-label="Envoyer">➤</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
