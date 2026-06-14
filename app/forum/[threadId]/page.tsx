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

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

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

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, i) => (
          <div key={post.id} className="p-5 rounded-2xl border"
            style={{ background: 'var(--navy-mid)', borderColor: i === 0 ? 'rgba(74,127,255,0.3)' : 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: i === 0 ? 'rgba(74,127,255,0.2)' : 'var(--navy-light)',
                  color: i === 0 ? 'var(--accent)' : 'var(--gray)',
                }}>
                {post.author_initials}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--white)' }}>{post.author_name}</p>
                <p className="text-xs" style={{ color: 'var(--gray)' }}>{fmt(post.created_at)}</p>
              </div>
              {i === 0 && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(74,127,255,0.15)', color: 'var(--accent)' }}>OP</span>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{post.content}</p>
          </div>
        ))}

        {posts.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--gray)' }}>
            Soyez le premier à répondre.
          </p>
        )}
      </div>

      {/* Reply form — réservé aux membres validés */}
      {isMember ? (
        <div className="mt-6 p-5 rounded-2xl border" style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--white)' }}>
            Répondre <span className="font-normal" style={{ color: 'var(--gray)' }}>en tant que {profile?.display_name}</span>
          </h3>
          <textarea rows={3} value={reply} onChange={e => setReply(e.target.value)}
            placeholder="Votre réponse…"
            className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none mb-3"
            style={{ background: 'var(--navy-light)', color: 'var(--white)' }} />
          <div className="flex justify-end">
            <button onClick={handleReply} disabled={!reply.trim() || sending}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}>
              {sending ? '…' : 'Envoyer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-6 rounded-2xl border text-center" style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
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
                Vous pourrez répondre dès que le bureau aura validé votre adhésion.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
