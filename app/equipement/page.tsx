'use client'

import { useState, useEffect } from 'react'
import { getListings, createListing } from '@/lib/data'
import type { Listing } from '@/lib/types'

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

interface ModalForm {
  title: string; category: string; condition: string
  price: string; description: string; city: string
  seller_name: string; seller_division: string
}

const EMPTY_FORM: ModalForm = {
  title: '', category: 'jambières', condition: 'très bon état',
  price: '', description: '', city: '', seller_name: '', seller_division: '',
}

export default function EquipementPage() {
  const [listings, setListings]   = useState<Listing[]>([])
  const [loading, setLoading]     = useState(true)
  const [catFilter, setCat]       = useState('Tout')
  const [condFilter, setCond]     = useState('Tout')
  const [divFilter, setDiv]       = useState('Tout')
  const [modalOpen, setModal]     = useState(false)
  const [form, setForm]           = useState<ModalForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [mobileOpen, setMobile]   = useState(false)

  useEffect(() => {
    getListings().then(data => { setListings(data); setLoading(false) })
  }, [])

  const filtered = listings.filter(l => {
    if (catFilter  !== 'Tout' && l.category         !== catFilter)  return false
    if (condFilter !== 'Tout' && l.condition         !== condFilter) return false
    if (divFilter  !== 'Tout' && l.seller_division   !== divFilter)  return false
    return true
  })

  const fmt = (cents: number) => `${Math.round(cents / 100)} €`

  const handleSubmit = async () => {
    if (!form.title || !form.price) return
    setSubmitting(true)
    const res = await createListing({
      title: form.title,
      category: form.category as Listing['category'],
      condition: form.condition as Listing['condition'],
      price: Math.round(parseFloat(form.price) * 100),
      description: form.description,
      city: form.city,
      seller_name: form.seller_name,
      seller_division: form.seller_division,
    })
    setSubmitting(false)
    if (res.ok) {
      setSubmitted(true)
      // Optimistic UI : ajoute à la liste locale
      setListings(prev => [{
        id: Date.now().toString(), ...form,
        price: Math.round(parseFloat(form.price) * 100),
        category: form.category as Listing['category'],
        condition: form.condition as Listing['condition'],
        created_at: new Date().toISOString(), is_active: true,
      }, ...prev])
      setTimeout(() => { setModal(false); setSubmitted(false); setForm(EMPTY_FORM) }, 1800)
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
              <button
                key={it}
                onClick={() => set(it)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  background: value === it ? 'rgba(74,127,255,0.15)' : 'transparent',
                  color: value === it ? 'var(--white)' : 'var(--gray)',
                }}
              >
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
      <div className="py-16" style={{ background: 'linear-gradient(180deg, rgba(74,127,255,0.08) 0%, transparent 100%)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Bourse d'équipement</p>
            <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>Équipement</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--gray)' }}>Achat et vente de matériel de gardien entre membres de la communauté</p>
          </div>
          <button onClick={() => setModal(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0" style={{ background: 'var(--accent)' }}>
            + Déposer une annonce
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Mobile filters */}
        <button className="md:hidden w-full mb-4 py-2.5 px-4 rounded-lg text-sm font-medium border flex items-center justify-between"
          style={{ borderColor: 'var(--border)', color: 'var(--gray)', background: 'var(--navy-mid)' }}
          onClick={() => setMobile(!mobileOpen)}
        >
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
                  <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />
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
                        <div key={l.id} className="p-5 rounded-2xl border flex flex-col gap-3 hover:border-accent/30 transition-colors"
                          style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}>
                          <div className="w-full h-24 rounded-xl flex items-center justify-center text-5xl"
                            style={{ background: 'var(--navy-light)' }}>
                            {CATEGORY_EMOJI[l.category] ?? '🔧'}
                          </div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-snug" style={{ color: 'var(--white)' }}>{l.title}</h3>
                            <span className="text-xl font-bold flex-shrink-0"
                              style={{ fontFamily: 'var(--font-bebas)', color: 'var(--accent)', letterSpacing: '0.05em' }}>
                              {fmt(l.price)}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--gray)' }}>{l.description}</p>
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

      {/* Modal dépôt annonce */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl tracking-widest" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)' }}>
                  Déposer une annonce
                </h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-lg" style={{ color: 'var(--gray)' }}>✕</button>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✓</div>
                  <p className="font-semibold" style={{ color: 'var(--white)' }}>Annonce publiée !</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--gray)' }}>Elle sera visible après validation par le bureau.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Titre */}
                  <label className="block">
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Titre *</span>
                    <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Warrior Ritual G7 — Jambières" />
                  </label>
                  {/* Catégorie + État */}
                  <div className="grid grid-cols-2 gap-3">
                    {(['category', 'condition'] as const).map(field => (
                      <label key={field} className="block">
                        <span className="text-xs font-medium mb-1.5 block capitalize" style={{ color: 'var(--gray)' }}>
                          {field === 'category' ? 'Catégorie *' : 'État *'}
                        </span>
                        <select className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                          style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                          value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>
                          {(field === 'category'
                            ? ['jambières','plastron','masque','gants','crosse','complet','autre']
                            : ['très bon état','bon état','usage']
                          ).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                  {/* Prix */}
                  <label className="block">
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Prix (€) *</span>
                    <input type="number" min="0" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="250" />
                  </label>
                  {/* Description */}
                  <label className="block">
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Description</span>
                    <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Détails, taille, utilisation…" />
                  </label>
                  {/* Ville + Nom */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Ville</span>
                      <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Paris" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Votre nom</span>
                      <input className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={form.seller_name} onChange={e => setForm(f => ({ ...f, seller_name: e.target.value }))} placeholder="Tonin C." />
                    </label>
                  </div>
                  {/* Division */}
                  <label className="block">
                    <span className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--gray)' }}>Division</span>
                    <select className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.seller_division} onChange={e => setForm(f => ({ ...f, seller_division: e.target.value }))}>
                      <option value="">Sélectionner</option>
                      {['Magnus','D1','D2','D3','Féminine Élite','Régionale','Loisir'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <button onClick={handleSubmit} disabled={!form.title || !form.price || submitting}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-2 disabled:opacity-50 transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)' }}>
                    {submitting ? 'Publication…' : 'Publier l\'annonce'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
