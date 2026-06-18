'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getListings, createListing, createContactRequest, uploadGoaliePhoto } from '@/lib/data'
import type { Listing } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
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
  const { user, profile, isMember, openAuth } = useAuth()
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

  const [mobileOpen, setMobile]         = useState(false)

  useEffect(() => {
    getListings().then(data => { setListings(data); setLoading(false) })
  }, [])

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
    await createContactRequest({
      listing_id: contactListing.id,
      listing_title: contactListing.title,
      buyer_name: contactForm.buyer_name,
      buyer_email: contactForm.buyer_email,
      buyer_phone: contactForm.buyer_phone || undefined,
      message: contactForm.message,
    })
    setContactSub(false)
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

  const Filters = () => (
    <div className="space-y-5">
      {([
        { label: 'Catégorie', items: CATEGORIES, value: catFilter, set: setCat, fmt: (c: string) => c === 'Tout' ? 'Toutes catégories' : `${CATEGORY_EMOJI[c] ?? ''} ${c}` },
        { label: 'État',      items: CONDITIONS, value: condFilter, set: setCond, fmt: (c: string) => c },
        { label: 'Division',  items: DIVISIONS,  value: divFilter,  set: setDiv,  fmt: (c: string) => c === 'Tout' ? 'Toutes divisions' : c },
      ] as const).map(({ label, items, value, set, fmt: fmtItem }) => (
        <div key={label}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gray)' }}>{label}</p>
          <div className="space-y-0.5">
            {(items as readonly string[]).map(it => (
              <button key={it} onClick={() => set(it)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{ background: value === it ? 'rgba(74,127,255,0.15)' : 'transparent', color: value === it ? 'var(--white)' : 'var(--gray)' }}>
                {fmtItem(it)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden py-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/huet-canadiens.jpg" position="center 30%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Bourse d&apos;équipement</p>
            <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>Équipement</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--gray)' }}>Achat et vente de matériel de gardien entre membres de la communauté</p>
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)' }}>
            {!user ? '🔒 Connexion pour déposer' : !isMember ? '⏳ Adhésion en attente' : '+ Déposer une annonce'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Mobile filters */}
        <button className="md:hidden w-full mb-4 py-2.5 px-4 rounded-lg text-sm font-medium border flex items-center justify-between"
          style={{ borderColor: 'var(--border)', color: 'var(--gray)', background: 'var(--navy-mid)' }}
          onClick={() => setMobile(!mobileOpen)}>
          <span>Filtres</span><span>{mobileOpen ? '▲' : '▼'}</span>
        </button>
        {mobileOpen && (
          <div className="md:hidden mb-6 p-4 rounded-xl border" style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
            <Filters />
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0 p-4 rounded-2xl border h-fit sticky top-24"
            style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
            <Filters />
          </aside>

          {/* Listings */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
                ))}
              </div>
            ) : (
              <>
                <p className="text-xs mb-4" style={{ color: 'var(--gray)' }}>{filtered.length} annonce{filtered.length !== 1 ? 's' : ''}</p>
                {filtered.length === 0 ? (
                  <p className="text-center py-16 text-sm" style={{ color: 'var(--gray)' }}>Aucune annonce pour ces filtres.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(l => {
                      const cond = CONDITION_COLOR[l.condition] ?? CONDITION_COLOR['usage']
                      return (
                        <div key={l.id} className="p-5 rounded-2xl border flex flex-col gap-3 hover:border-accent/30 transition-colors card-lift"
                          style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
                          {/* Photo de couverture, sinon emoji */}
                          <div className="relative w-full h-40 rounded-xl overflow-hidden flex items-center justify-center text-5xl"
                            style={{ background: 'var(--navy-light)' }}>
                            {l.photos && l.photos.length > 0 ? (
                              <>
                                <Image src={l.photos[0]} alt={l.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 360px" />
                                {l.photos.length > 1 && (
                                  <span className="absolute bottom-1.5 right-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                                    📷 {l.photos.length}
                                  </span>
                                )}
                              </>
                            ) : (CATEGORY_EMOJI[l.category] ?? '🔧')}
                          </div>
                          {/* Titre + prix */}
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--white)' }}>{l.title}</h3>
                            <span className="text-xl font-bold flex-shrink-0"
                              style={{ fontFamily: 'var(--font-bebas)', color: 'var(--accent)', letterSpacing: '0.05em' }}>
                              {fmt(l.price)}
                            </span>
                          </div>
                          {/* Description */}
                          <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--gray)' }}>{l.description}</p>
                          {/* Vendeur + état */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium" style={{ color: 'var(--white)' }}>{l.seller_name}</p>
                              <p className="text-xs" style={{ color: 'var(--gray)' }}>{l.city}{l.seller_division ? ` · ${l.seller_division}` : ''}</p>
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
                              style={{ background: cond.bg, color: cond.color }}>
                              {l.condition}
                            </span>
                          </div>
                          {/* ── Bouton Contacter ── */}
                          <button
                            onClick={() => openContact(l)}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95 mt-1"
                            style={{ background: 'var(--accent)', boxShadow: '0 4px 16px rgba(74,127,255,0.25)' }}
                          >
                            Contacter le vendeur
                          </button>
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
                  <p className="text-sm mt-1" style={{ color: 'var(--gray)' }}>Visible après validation par le bureau.</p>
                </div>
              ) : (
                <div className="space-y-4">
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
                      placeholder="Warrior Ritual G7 — Jambières" />
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
                  <button onClick={handleDepot} disabled={!depotForm.title || !depotForm.price || depotSubmitting}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--accent)' }}>
                    {depotSubmitting ? 'Publication…' : "Publier l'annonce"}
                  </button>
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
                    Le vendeur vous contactera par email sous 48h.
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
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-all hover:-translate-y-0.5"
                      style={{ background: 'var(--accent)', boxShadow: '0 4px 20px rgba(74,127,255,0.3)' }}
                    >
                      {contactSubmitting ? 'Envoi…' : '📩 Envoyer ma demande'}
                    </button>
                    <p className="text-center text-[11px]" style={{ color: 'var(--gray)' }}>
                      Vos coordonnées seront transmises au vendeur via l&apos;ANGB.
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
