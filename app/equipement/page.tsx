'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getListings, createListing, createContactRequest, uploadGoaliePhoto } from '@/lib/data'
import type { Listing } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { useContent } from '@/contexts/ContentContext'
import HeaderPhoto from '@/components/HeaderPhoto'

const CATEGORIES = ['Tout', 'jambières', 'plastron', 'masque', 'gants', 'crosse', 'complet', 'autre']
const CONDITIONS = ['Tout', 'très bon état', 'bon état', 'usage']
const DIVISIONS  = ['Tout', 'Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']

const CATEGORY_EMOJI: Record<string, string> = {
  jambières: '🦵', masque: '😷', gants: '🧤', plastron: '🛡️',
  crosse: '🏒', complet: '📦', autre: '🔧',
}

const CONDITION_COLOR: Record<string, { bg: string; color: string }> = {
  'très bon état': { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  'bon état':      { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
  'usage':         { bg: 'rgba(139,160,181,0.15)', color: '#8a9ab5' },
}

interface DepotForm {
  title: string; category: string; condition: string
  price: string; description: string; city: string
  seller_name: string; seller_division: string
  photos: string[]
}

const EMPTY_DEPOT: DepotForm = {
  title: '', category: 'jambières', condition: 'très bon état',
  price: '', description: '', city: '', seller_name: '', seller_division: '', photos: [],
}

interface ContactForm {
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  message: string
}

export default function EquipementPage() {
  const { user, profile, isMember, openAuth, loading: authLoading } = useAuth()
  const c = useContent()
  const [listings, setListings]         = useState<Listing[]>([])
  const [loading, setLoading]           = useState(true)
  const [catFilter, setCat]             = useState('Tout')
  const [condFilter, setCond]           = useState('Tout')
  const [divFilter, setDiv]             = useState('Tout')

  // Modal dépôt annonce
  const [depotOpen, setDepot]           = useState(false)
  const [depotForm, setDepotForm]       = useState<DepotForm>(EMPTY_DEPOT)
  const [depotSubmitting, setDepotSub]  = useState(false)
  const [depotDone, setDepotDone]       = useState(false)
  const [photoUploading, setPhotoUp]    = useState(false)
  const photoRef                        = useRef<HTMLInputElement>(null)

  const handlePhotosAdd = async (files: FileList | null) => {
    if (!files || !user) return
    setPhotoUp(true)
    const urls: string[] = []
    for (const f of Array.from(files)) {
      const { url } = await uploadGoaliePhoto(user.id, f)
      if (url) urls.push(url)
    }
    setDepotForm(f => ({ ...f, photos: [...f.photos, ...urls] }))
    setPhotoUp(false)
    if (photoRef.current) photoRef.current.value = ''
  }

  // Modal contact vendeur
  const [contactListing, setContactListing] = useState<Listing | null>(null)
  const [contactForm, setContactForm]   = useState<ContactForm>({ buyer_name: '', buyer_email: '', buyer_phone: '', message: '' })
  const [contactSubmitting, setContactSub] = useState(false)
  const [contactDone, setContactDone]   = useState(false)

  const [step, setStep]                 = useState(1)
  const [contactErr, setContactErr]     = useState('')
  useEffect(() => { if (depotOpen) setStep(1) }, [depotOpen])

  useEffect(() => {
    getListings().then(data => { setListings(data); setLoading(false) })
  }, [])

  // Ouvre directement le dépôt d'annonce via /equipement?vendre=1 (menu « Vendre »)
  // Lien « Vendre mon matériel » : ouvre le dépôt si membre, sinon la connexion
  useEffect(() => {
    if (authLoading || new URLSearchParams(window.location.search).get('vendre') !== '1') return
    if (!user) openAuth('login')
    else if (isMember) setDepot(true)
    window.history.replaceState(null, '', '/equipement')
  }, [authLoading, user, isMember, openAuth])

  // Pré-remplir le message quand on ouvre le modal contact
  const openContact = (listing: Listing) => {
    setContactListing(listing)
    setContactForm({
      buyer_name: '',
      buyer_email: '',
      buyer_phone: '',
      message: `Bonjour,\n\nJe suis intéressé(e) par votre annonce "${listing.title}" à ${fmt(listing.price)}.\n\nPourriez-vous me contacter pour organiser la transaction ?\n\nMerci !`,
    })
    setContactDone(false)
  }

  const handleContact = async () => {
    if (!contactListing || !contactForm.buyer_name || !contactForm.buyer_email) return
    setContactSub(true)
    setContactErr('')
    await createContactRequest({
      listing_id: contactListing.id,
      listing_title: contactListing.title,
      buyer_name: contactForm.buyer_name,
      buyer_email: contactForm.buyer_email,
      buyer_phone: contactForm.buyer_phone || undefined,
      message: contactForm.message,
    })
    // Envoi d'un vrai e-mail au vendeur (ou au bureau si le vendeur n'a pas de compte lié)
    const res = await fetch('/api/message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toName: contactListing.seller_name, toUserId: contactListing.user_id,
        fromName: contactForm.buyer_name, fromEmail: contactForm.buyer_email,
        context: `votre annonce « ${contactListing.title} »`,
        message: contactForm.message + (contactForm.buyer_phone ? `\n\nTéléphone : ${contactForm.buyer_phone}` : ''),
      }),
    }).then(r => r.json()).catch(() => ({ ok: false }))
    setContactSub(false)
    if (!res.ok) { setContactErr("L'envoi n'a pas fonctionné. Réessaie dans un instant."); return }
    setContactDone(true)
    setTimeout(() => { setContactListing(null); setContactDone(false) }, 2500)
  }

  const filtered = listings.filter(l => {
    if (catFilter  !== 'Tout' && l.category       !== catFilter)  return false
    if (condFilter !== 'Tout' && l.condition       !== condFilter) return false
    if (divFilter  !== 'Tout' && l.seller_division !== divFilter)  return false
    return true
  })

  const fmt = (cents: number) => `${Math.round(cents / 100)} €`

  const handleDepot = async () => {
    if (!depotForm.title || !depotForm.price) return
    setDepotSub(true)
    const res = await createListing({
      title: depotForm.title,
      category: depotForm.category as Listing['category'],
      condition: depotForm.condition as Listing['condition'],
      price: Math.round(parseFloat(depotForm.price) * 100),
      description: depotForm.description,
      city: depotForm.city,
      seller_name: depotForm.seller_name,
      seller_division: depotForm.seller_division,
      photos: depotForm.photos,
    }, user?.id)
    setDepotSub(false)
    if (res.ok) {
      setDepotDone(true)
      setListings(prev => [{
        id: Date.now().toString(), ...depotForm,
        price: Math.round(parseFloat(depotForm.price) * 100),
        category: depotForm.category as Listing['category'],
        condition: depotForm.condition as Listing['condition'],
        created_at: new Date().toISOString(), is_active: true,
      }, ...prev])
      setTimeout(() => { setDepot(false); setDepotDone(false); setDepotForm(EMPTY_DEPOT) }, 1800)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden py-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/huet-canadiens.jpg" position="center 30%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>{c('equip.header.overline')}</p>
            <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>{c('equip.header.title')}</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--gray)' }}>{c('equip.header.sub')}</p>
          </div>
          <button
            onClick={() => {
              if (!user) { openAuth('login'); return }
              if (!isMember) return   // adhésion en attente
              // Pré-remplir le nom vendeur depuis le profil
              if (profile?.display_name) setDepotForm(f => ({ ...f, seller_name: profile.display_name }))
              setDepot(true)
            }}
            disabled={!!user && !isMember}
            className="btn-sport px-5 py-2.5 text-xs flex-shrink-0">
            {!user ? '🔒 Connexion pour déposer' : !isMember ? '⏳ Adhésion en attente' : '+ Déposer une annonce'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Bandeau confiance : l'essentiel en 3 pastilles */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {[['🤝', c('equip.nocommission').split(' : ')[0] || 'Aucune commission'], ['👋', 'Remise en main propre conseillée'], ['🔒', 'Jamais de données bancaires']].map(([ic, t]) => (
            <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(52,211,153,0.1)', color: '#bdf5dc', border: '1px solid rgba(52,211,153,0.3)' }}>{ic} {t}</span>
          ))}
        </div>
        <details className="mb-6 group">
          <summary className="cursor-pointer text-xs font-semibold list-none inline-flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            <span className="transition-transform group-open:rotate-90">›</span> Comment ça marche
          </summary>
          <p className="mt-2 text-xs leading-relaxed max-w-3xl" style={{ color: 'var(--gray)' }}>
            {c('equip.nocommission')} L&apos;ANGB n&apos;est pas responsable des échanges, paiements ou litiges : vérifie le matériel avant de payer.
          </p>
        </details>

        {/* Filtres en pastilles */}
        <div className="flex gap-2 overflow-x-auto no-visible-scrollbar pb-2 mb-3 -mx-4 px-4 md:mx-0 md:px-0">
          {CATEGORIES.map(cat => {
            const on = catFilter === cat
            return (
              <button key={cat} onClick={() => setCat(cat)} className="px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: on ? 'var(--accent)' : 'var(--navy-mid)', color: on ? '#fff' : 'var(--gray)', border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`, boxShadow: on ? '0 4px 14px rgba(91,141,255,0.35)' : 'none' }}>
                {cat === 'Tout' ? 'Tout' : `${CATEGORY_EMOJI[cat] ?? ''} ${cat}`}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <select value={condFilter} onChange={e => setCond(e.target.value)} className="px-3 py-2 rounded-full text-xs font-semibold outline-none"
            style={{ background: 'var(--navy-mid)', color: condFilter === 'Tout' ? 'var(--gray)' : 'var(--white)', border: '1px solid var(--border)' }}>
            {CONDITIONS.map(x => <option key={x} value={x}>{x === 'Tout' ? 'Tous les états' : x}</option>)}
          </select>
          <select value={divFilter} onChange={e => setDiv(e.target.value)} className="px-3 py-2 rounded-full text-xs font-semibold outline-none"
            style={{ background: 'var(--navy-mid)', color: divFilter === 'Tout' ? 'var(--gray)' : 'var(--white)', border: '1px solid var(--border)' }}>
            {DIVISIONS.map(x => <option key={x} value={x}>{x === 'Tout' ? 'Toutes divisions' : x}</option>)}
          </select>
          {(catFilter !== 'Tout' || condFilter !== 'Tout' || divFilter !== 'Tout') && (
            <button onClick={() => { setCat('Tout'); setCond('Tout'); setDiv('Tout') }} className="text-xs font-semibold px-2" style={{ color: 'var(--gray)' }}>Réinitialiser ✕</button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Listings */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
                ))}
              </div>
            ) : (
              <>
                <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>{filtered.length} annonce{filtered.length !== 1 ? 's' : ''}</p>
                {filtered.length === 0 ? (
                  <p className="text-center py-16 text-sm" style={{ color: 'var(--gray)' }}>{listings.length === 0 ? 'Aucune annonce disponible pour le moment.' : 'Aucune annonce pour ces filtres.'}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(l => {
                      const cond = CONDITION_COLOR[l.condition] ?? CONDITION_COLOR['usage']
                      return (
                        <div key={l.id} className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5"
                          style={{ background: 'var(--navy-card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
                          <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center text-6xl" style={{ background: 'var(--navy-light)' }}>
                            {l.photos && l.photos.length > 0 ? (
                              <Image src={l.photos[0]} alt={l.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width:768px) 100vw, 360px" />
                            ) : (
                              <span className="transition-transform duration-500 group-hover:scale-125">{CATEGORY_EMOJI[l.category] ?? '🔧'}</span>
                            )}
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,14,28,0.7), transparent 50%)' }} />
                            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur"
                              style={{ background: cond.bg, color: cond.color, border: `1px solid ${cond.color}55` }}>{l.condition}</span>
                            {l.photos && l.photos.length > 1 && (
                              <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>📷 {l.photos.length}</span>
                            )}
                            <span className="absolute bottom-3 right-3 text-3xl leading-none px-3 py-1 rounded-xl"
                              style={{ fontFamily: 'var(--font-bebas)', color: '#fff', background: 'rgba(15,27,51,0.75)', letterSpacing: '0.04em' }}>{fmt(l.price)}</span>
                          </div>
                          <div className="p-4 flex flex-col gap-2 flex-1">
                            <h3 className="font-bold text-[15px] leading-snug" style={{ color: 'var(--white)' }}>{l.title}</h3>
                            {l.description && <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--gray)' }}>{l.description}</p>}
                            <p className="text-xs mt-auto pt-1" style={{ color: 'var(--gray)' }}>
                              📍 {[l.city, l.seller_division].filter(Boolean).join(' · ') || 'Lieu à préciser'}{l.seller_name ? ` · ${l.seller_name}` : ''}
                            </p>
                            <button onClick={() => openContact(l)} className="btn-sport w-full py-2.5 text-xs mt-2">Contacter le vendeur</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal dépôt annonce ─────────────────────────────────── */}
      {depotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setDepot(false) }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl tracking-widest" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)' }}>
                  Déposer une annonce
                </h2>
                <button onClick={() => setDepot(false)} className="p-2 rounded-lg hover:bg-white/10" style={{ color: 'var(--gray)' }}>✕</button>
              </div>
              {depotDone ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✓</div>
                  <p className="font-semibold" style={{ color: 'var(--white)' }}>Annonce publiée !</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--gray)' }}>Elle est en ligne. Les acheteurs te contacteront par e-mail.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Progression des étapes */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--gray)' }}>
                      {['Le matériel', 'Le prix', 'Toi'].map((t, i) => (
                        <span key={t} style={{ color: step >= i + 1 ? 'var(--white)' : 'var(--gray)' }}>{i + 1}. {t}</span>
                      ))}
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--navy-light)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%`, background: 'linear-gradient(to right,#002395,#5b8dff,#ED2939)' }} />
                    </div>
                  </div>
                  {step === 1 && (<div className="space-y-4 menu-drop">
                  {/* Photos (style Vinted) */}
                  <div>
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Photos de l&apos;équipement</span>
                    <div className="flex gap-2 flex-wrap">
                      {depotForm.photos.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden" style={{ background: 'var(--navy-light)' }}>
                          <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                          {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-[8px] font-bold text-center text-white" style={{ background: 'rgba(74,127,255,0.85)' }}>COUVERTURE</span>}
                          <button type="button" onClick={() => setDepotForm(f => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => photoRef.current?.click()} disabled={photoUploading}
                        className="w-20 h-20 rounded-lg flex flex-col items-center justify-center disabled:opacity-60"
                        style={{ background: 'var(--navy-light)', border: '1px dashed rgba(255,255,255,0.2)', color: 'var(--gray)' }}>
                        {photoUploading ? '…' : <><span className="text-lg">📷</span><span className="text-[9px] mt-0.5">Ajouter</span></>}
                      </button>
                    </div>
                    <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotosAdd(e.target.files)} />
                  </div>

                  <label className="block">
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Titre *</span>
                    <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={depotForm.title} onChange={e => setDepotForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Warrior Ritual G7 · Jambières" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['category', 'condition'] as const).map(field => (
                      <label key={field} className="block">
                        <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>
                          {field === 'category' ? 'Catégorie *' : 'État *'}
                        </span>
                        <select className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                          value={depotForm[field]} onChange={e => setDepotForm(f => ({ ...f, [field]: e.target.value }))}>
                          {(field === 'category'
                            ? ['jambières','plastron','masque','gants','crosse','complet','autre']
                            : ['très bon état','bon état','usage']
                          ).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} disabled={!depotForm.title.trim()} className="btn-sport w-full py-3 text-xs">Suivant →</button>
                  </div>)}
                  {step === 2 && (<div className="space-y-4 menu-drop">
                  <label className="block">
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Prix (€) *</span>
                    <input type="number" min="0" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={depotForm.price} onChange={e => setDepotForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="250" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Description</span>
                    <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={depotForm.description} onChange={e => setDepotForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Détails, taille, utilisation…" />
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setStep(1)} className="btn-sport-ghost flex-1 py-3 text-xs">← Retour</button>
                    <button onClick={() => setStep(3)} disabled={!depotForm.price} className="btn-sport flex-1 py-3 text-xs">Suivant →</button>
                  </div>
                  </div>)}
                  {step === 3 && (<div className="space-y-4 menu-drop">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Ville</span>
                      <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={depotForm.city} onChange={e => setDepotForm(f => ({ ...f, city: e.target.value }))} placeholder="Paris" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Votre nom</span>
                      <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={depotForm.seller_name} onChange={e => setDepotForm(f => ({ ...f, seller_name: e.target.value }))} placeholder="Tonin C." />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Division</span>
                    <select className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={depotForm.seller_division} onChange={e => setDepotForm(f => ({ ...f, seller_division: e.target.value }))}>
                      <option value="">Sélectionner</option>
                      {['Magnus','D1','D2','D3','Féminine Élite','Régionale','Loisir'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => setStep(2)} className="btn-sport-ghost flex-1 py-3 text-xs">← Retour</button>
                    <button onClick={handleDepot} disabled={!depotForm.title || !depotForm.price || depotSubmitting} className="btn-sport flex-1 py-3 text-xs">
                      {depotSubmitting ? 'Publication…' : "Publier l'annonce"}
                    </button>
                  </div>
                  </div>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal contact vendeur ───────────────────────────────── */}
      {contactListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setContactListing(null) }}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl tracking-widest" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)' }}>
                  Contacter le vendeur
                </h2>
                <button onClick={() => setContactListing(null)} className="p-2 rounded-lg hover:bg-white/10" style={{ color: 'var(--gray)' }}>✕</button>
              </div>

              {contactDone ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                    style={{ background: 'rgba(52,211,153,0.15)' }}>✓</div>
                  <p className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-bebas)', color: '#34d399', letterSpacing: '0.04em' }}>
                    Message envoyé !
                  </p>
                  <p className="text-sm" style={{ color: 'var(--gray)' }}>
                    Le vendeur a reçu ton message par e-mail. Il te répondra directement.
                  </p>
                </div>
              ) : (
                <>
                  {/* Aperçu de l'annonce */}
                  <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
                    style={{ background: 'var(--navy-light)', border: '1px solid var(--border)' }}>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'var(--navy-mid)' }}>
                      {CATEGORY_EMOJI[contactListing.category] ?? '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--white)' }}>{contactListing.title}</p>
                      <p className="text-xs" style={{ color: 'var(--gray)' }}>
                        Vendeur : {contactListing.seller_name}{contactListing.city ? ` · ${contactListing.city}` : ''}
                      </p>
                    </div>
                    <span className="text-lg font-bold flex-shrink-0"
                      style={{ fontFamily: 'var(--font-bebas)', color: 'var(--accent)', letterSpacing: '0.05em' }}>
                      {fmt(contactListing.price)}
                    </span>
                  </div>

                  {/* Formulaire */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Votre nom *</span>
                        <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                          value={contactForm.buyer_name}
                          onChange={e => setContactForm(f => ({ ...f, buyer_name: e.target.value }))}
                          placeholder="Prénom Nom" />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Téléphone</span>
                        <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                          value={contactForm.buyer_phone}
                          onChange={e => setContactForm(f => ({ ...f, buyer_phone: e.target.value }))}
                          placeholder="06 xx xx xx xx" />
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Email *</span>
                      <input type="email" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={contactForm.buyer_email}
                        onChange={e => setContactForm(f => ({ ...f, buyer_email: e.target.value }))}
                        placeholder="vous@email.com" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Message</span>
                      <textarea rows={5} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={contactForm.message}
                        onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} />
                    </label>

                    <button
                      onClick={handleContact}
                      disabled={!contactForm.buyer_name || !contactForm.buyer_email || contactSubmitting}
                      className="btn-sport w-full py-3 text-xs"
                    >
                      {contactSubmitting ? 'Envoi…' : '📩 Envoyer ma demande'}
                    </button>
                    {contactErr && <p className="text-center text-xs" style={{ color: '#fca5a5' }}>{contactErr}</p>}
                    <p className="text-center text-[11px]" style={{ color: 'var(--gray)' }}>
                      Ton message et ton e-mail sont envoyés au vendeur, pour qu&apos;il puisse te répondre.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
