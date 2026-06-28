'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { createListing, uploadGoaliePhoto } from '@/lib/data'
import type { Listing } from '@/lib/types'
import HeaderPhoto from '@/components/HeaderPhoto'

const CATEGORIES = ['jambières', 'plastron', 'masque', 'gants', 'crosse', 'complet', 'autre']
const CONDITIONS = ['très bon état', 'bon état', 'usage']
const DIVISIONS  = ['', 'Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']

export default function VendrePage() {
  const { user, profile, isMember, loading, openAuth } = useAuth()
  const { openAdhesion } = useAdhesion()

  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('jambières')
  const [condition, setCondition] = useState('très bon état')
  const [price, setPrice]       = useState('')
  const [city, setCity]         = useState('')
  const [division, setDivision] = useState('')
  const [description, setDesc]  = useState('')
  const [sellerName, setSeller] = useState('')
  const [photos, setPhotos]     = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)
  const [err, setErr]           = useState('')
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (profile?.display_name) setSeller(profile.display_name) }, [profile])

  const addPhotos = async (files: FileList | null) => {
    if (!files || !user) return
    setUploading(true)
    const urls: string[] = []
    for (const f of Array.from(files)) {
      const { url } = await uploadGoaliePhoto(user.id, f)
      if (url) urls.push(url)
    }
    setPhotos(p => [...p, ...urls])
    setUploading(false)
    if (photoRef.current) photoRef.current.value = ''
  }

  const submit = async () => {
    if (!title.trim() || !price) { setErr('Le titre et le prix sont obligatoires.'); return }
    setSaving(true); setErr('')
    const res = await createListing({
      title: title.trim(),
      category: category as Listing['category'],
      condition: condition as Listing['condition'],
      price: Math.round(parseFloat(price) * 100),
      description: description.trim(),
      city: city.trim(),
      seller_name: sellerName.trim() || 'Membre ANGB',
      seller_division: division,
      photos,
    }, user?.id)
    setSaving(false)
    if (!res.ok) { setErr(res.error || 'Erreur lors de la publication.'); return }
    setDone(true)
  }

  // ── États d'accès ──────────────────────────────────────────────────────────
  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-20"><div className="h-96 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} /></div>
  }
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-lg mb-4" style={{ color: 'var(--white)' }}>Connecte-toi pour vendre ton matériel</p>
        <button onClick={() => openAuth('login')} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>Se connecter</button>
      </div>
    )
  }
  if (!isMember) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-lg mb-2" style={{ color: 'var(--white)' }}>Dépôt réservé aux membres</p>
        <p className="text-sm mb-5" style={{ color: 'var(--gray)' }}>Ton adhésion doit être validée pour déposer une annonce.</p>
        <button onClick={openAdhesion} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>Rejoindre l&apos;ANGB</button>
      </div>
    )
  }
  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-xl font-bold mb-2" style={{ color: 'var(--white)' }}>Annonce publiée !</p>
        <p className="text-sm mb-6" style={{ color: 'var(--gray)' }}>Ton matériel est désormais visible dans la bourse d&apos;équipement.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/equipement" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>Voir les annonces</Link>
          <button onClick={() => { setDone(false); setTitle(''); setPrice(''); setDesc(''); setCity(''); setPhotos([]) }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ color: 'var(--gray)', border: '1px solid var(--border)' }}>Déposer une autre</button>
        </div>
      </div>
    )
  }

  const field = { background: 'var(--navy-light)', color: 'var(--white)', border: '1px solid var(--border)' }

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden py-14" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/hardy.jpg" position="center 30%" />
        <div className="relative max-w-2xl mx-auto px-4 md:px-8">
          <span className="overline-fr mb-3 inline-block">Bourse d&apos;équipement</span>
          <h1 className="text-4xl md:text-6xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Vendre mon matériel
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--gray)' }}>
            Dépose ton équipement de gardien en quelques secondes. <Link href="/equipement" className="font-semibold" style={{ color: 'var(--accent)' }}>← Retour aux annonces</Link>
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="rounded-2xl p-6 md:p-8 space-y-5" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>

          {/* Photos */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--gray)' }}>📷 Photos</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photos.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden" style={{ background: 'var(--navy-light)' }}>
                  <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="80px" />
                  <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>✕</button>
                </div>
              ))}
              <button onClick={() => photoRef.current?.click()} disabled={uploading}
                className="w-20 h-20 rounded-lg flex flex-col items-center justify-center text-xs disabled:opacity-60"
                style={{ background: 'var(--navy-light)', border: '1px dashed var(--border-mid)', color: 'var(--gray)' }}>
                {uploading ? '…' : <><span className="text-lg">+</span><span className="text-[10px]">Ajouter</span></>}
              </button>
            </div>
            <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addPhotos(e.target.files)} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Jambières Bauer Vapor 2X Pro — taille 34+1"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={field} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Catégorie</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={field}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>État</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={field}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Prix (€) *</label>
              <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" placeholder="280"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={field} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Ville</label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Montpellier"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={field} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Ton nom (vendeur)</label>
              <input value={sellerName} onChange={e => setSeller(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={field} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Division</label>
              <select value={division} onChange={e => setDivision(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={field}>
                {DIVISIONS.map(d => <option key={d} value={d}>{d || '—'}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gray)' }}>Description</label>
            <textarea value={description} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Taille, état précis, raison de la vente, possibilité d'envoi…"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={field} />
          </div>

          {err && <p className="text-xs" style={{ color: '#f87171' }}>{err}</p>}

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px]" style={{ color: 'var(--gray)' }}>L&apos;ANGB n&apos;est pas responsable des transactions · méfie-toi des arnaques.</p>
            <button onClick={submit} disabled={saving}
              className="flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.3)' }}>
              {saving ? 'Publication…' : 'Publier l’annonce'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
