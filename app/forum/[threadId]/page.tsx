'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getThread, getPosts, createPost } from '@/lib/data'
import type { Thread, Post } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const { user, profile, isMember, openAuth } = useAuth()
  const [thread, setThread]   = useState<Thread | null>(null)
  const [posts, setPosts]     = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply]     = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Promise.all([
      getThread(params.threadId),
      getPosts(params.threadId),
    ]).then(([t, p]) => {
      setThread(t)
      setPosts(p)
      setLoading(false)
    })
  }, [params.threadId])

  const handleReply = async () => {
    if (!reply.trim() || !isMember) return
    setSending(true)
    const authorName = profile?.display_name?.trim() || 'Membre ANGB'
    const initials = authorName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const res = await createPost({
      thread_id: params.threadId,
      content: reply.trim(),
      author_name: authorName,
      author_initials: initials,
    })
    setSending(false)
    if (res.ok) {
      // Optimistic
      setPosts(prev => [...prev, {
        id: Date.now().toString(),
        thread_id: params.threadId,
        content: reply.trim(),
        author_name: authorName,
        author_initials: initials,
        created_at: new Date().toISOString(),
      }])
      setReply('')
    }
  }

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
        ))}
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p style={{ color: 'var(--gray)' }}>Thread introuvable.</p>
        <Link href="/forum" className="mt-4 inline-block text-sm" style={{ color: 'var(--accent)' }}>← Retour au forum</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--gray)' }}>
        <Link href="/forum" className="hover:text-white transition-colors">Forum</Link>
        <span>›</span>
        <span>{thread.category}</span>
      </div>

      <h1 className="text-3xl md:text-4xl mb-8"
        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
        {thread.title}
      </h1>

      {/* ── Fil de discussion (style messagerie) ────────────────────────── */}
      <div className="rounded-2xl p-4 md:p-5 space-y-2.5" style={{ background: 'var(--navy)', border: '1px solid var(--border)' }}>
        {posts.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: 'var(--gray)' }}>Aucun message · lance la discussion !</p>
        ) : posts.map(post => {
          const mine = isMember && post.author_name === profile?.display_name
          return (
            <div key={post.id} className={`flex gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 self-end"
                  style={{ background: 'var(--navy-light)', color: 'var(--gray)' }}>
                  {post.author_initials}
                </div>
              )}
              <div className="max-w-[80%] px-3.5 py-2"
                style={{
                  background: mine ? 'rgba(16,108,80,0.42)' : 'var(--navy-mid)',
                  border: `1px solid ${mine ? 'rgba(37,211,102,0.3)' : 'var(--border)'}`,
                  borderRadius: 14,
                  borderTopLeftRadius: mine ? 14 : 4,
                  borderTopRightRadius: mine ? 4 : 14,
                }}>
                {!mine && <p className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--accent)' }}>{post.author_name}</p>}
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--white)' }}>{post.content}</p>
                <p className="text-[10px] mt-1 text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>{fmtTime(post.created_at)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Zone de saisie (style WhatsApp) ─────────────────────────────── */}
      {isMember ? (
        <div className="mt-3 flex items-end gap-2">
          <div className="flex-1 flex items-center rounded-3xl px-4 py-2.5" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <textarea
              rows={1}
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply() } }}
              placeholder={`Message en tant que ${profile?.display_name}…`}
              className="flex-1 bg-transparent text-sm outline-none resize-none max-h-32"
              style={{ color: 'var(--white)' }}
            />
          </div>
          <button onClick={handleReply} disabled={!reply.trim() || sending}
            aria-label="Envoyer"
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-transform active:scale-90"
            style={{ background: '#25D366' }}>
            {sending
              ? <span className="text-white text-sm">…</span>
              : <svg width="20" height="20" viewBox="0 0 24 24"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" fill="#fff" /></svg>}
          </button>
        </div>
      ) : (
        <div className="mt-4 p-6 rounded-2xl border text-center" style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
          {!user ? (
            <>
              <p className="text-sm mb-1" style={{ color: 'var(--white)' }}>Réservé aux adhérents</p>
              <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>
                Adhérez à l'ANGB (gratuit la 1ʳᵉ année) pour participer aux discussions.
              </p>
              <button onClick={() => openAuth('login')}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)' }}>
                Se connecter / adhérer
              </button>
            </>
          ) : (
            <>
              <p className="text-sm mb-1" style={{ color: '#fbbf24' }}>⏳ Adhésion en attente de validation</p>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>
                Vous pourrez écrire dès que le bureau aura validé votre adhésion.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
