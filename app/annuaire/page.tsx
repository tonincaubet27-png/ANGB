'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useAdhesion } from '@/contexts/AdhesionContext'
import { getGoalieProfiles, updateGoalieProfile, uploadGoaliePhoto } from '@/lib/data'
import PhotoUpload from '@/components/PhotoUpload'
import HeaderPhoto from '@/components/HeaderPhoto'
import type { GoalieProfile, MemberCategory, CareerEntry, TrainingEntry, EtudesEntry } from '@/lib/types'

// Sections de l'annuaire par catégorie de membre — on accueille tout le monde
const CATEGORY_SECTIONS: { key: MemberCategory; label: string; singular: string; icon: string }[] = [
  { key: 'gardien',            label: 'Gardiens',             singular: 'gardien',            icon: '🥅' },
  { key: 'entraineur_gardien', label: 'Entraîneurs gardiens', singular: 'entraîneur gardien', icon: '🧤' },
  { key: 'entraineur',         label: 'Entraîneurs',          singular: 'entraîneur',         icon: '📋' },
  { key: 'joueur',             label: 'Joueurs',              singular: 'joueur',             icon: '🏒' },
  { key: 'membre_soutien',     label: 'Membres soutien',      singular: 'membre soutien',     icon: '🤝' },
]

// ── Constantes ───────────────────────────────────────────────────────────────
const FOUNDER_NAMES = new Set([
  'Tonin Caubet', 'Pacôme Courtoison', 'Steven Catelin',
  'Flo Gourdin', 'Jean-JP Fontaine', 'Adrien Vazzaz',
])
const DIVISIONS = ['Toutes', 'Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']
const REGIONS   = ['Toutes', 'Île-de-France', 'Normandie', 'Occitanie', 'Nouvelle-Aquitaine',
  'Auvergne-Rhône-Alpes', 'Hauts-de-France', 'Rhône-Alpes', 'Bretagne', 'PACA', 'Grand Est']
const DIV_DIVISIONS = ['Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']

const DC: Record<string, { bg: string; color: string }> = {
  Magnus:           { bg: 'rgba(74,127,255,0.15)',  color: '#4a7fff' },
  D1:               { bg: 'rgba(192,132,252,0.15)', color: '#c084fc' },
  D2:               { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c' },
  D3:               { bg: 'rgba(52,211,153,0.15)',  color: '#34d399' },
  'Féminine Élite': { bg: 'rgba(237,41,57,0.15)',   color: '#ED2939' },
  Régionale:        { bg: 'rgba(139,160,181,0.15)', color: '#8a9ab5' },
}
const AP = [
  { bg: 'rgba(74,127,255,0.2)',  color: '#4a7fff' },
  { bg: 'rgba(192,132,252,0.2)', color: '#c084fc' },
  { bg: 'rgba(251,146,60,0.2)',  color: '#fb923c' },
  { bg: 'rgba(52,211,153,0.2)',  color: '#34d399' },
  { bg: 'rgba(237,41,57,0.2)',   color: '#ED2939' },
]
const dc  = (d?: string) => DC[d ?? ''] ?? { bg: 'rgba(139,160,181,0.15)', color: '#8a9ab5' }
const ini = (n: string)  => n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

// ── ProfileDrawer ─────────────────────────────────────────────────────────────
function ProfileDrawer({
  goalie, onClose, canEdit, onSaved,
}: {
  goalie: GoalieProfile
  onClose: () => void
  canEdit: boolean
  onSaved: (updated: GoalieProfile) => void
}) {
  const [editing, setEditing] = useState(false)
  const div = dc(goalie.division)
  const isFounder = FOUNDER_NAMES.has(goalie.name)

  // Fermeture ESC + scroll lock
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <>
      <motion.div key="bd"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      />
      <motion.aside key="dr"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
        style={{ width: 'min(640px, 100vw)', background: '#080f1c', borderLeft: '1px solid rgba(74,127,255,0.2)', boxShadow: '-20px 0 60px rgba(0,0,0,0.6)' }}
      >
        {editing ? (
          <EditForm goalie={goalie} onCancel={() => setEditing(false)} onSaved={updated => { setEditing(false); onSaved(updated) }} />
        ) : (
          <ViewProfile goalie={goalie} div={div} isFounder={isFounder} canEdit={canEdit}
            onClose={onClose} onEdit={() => setEditing(true)} />
        )}
      </motion.aside>
    </>
  )
}

// ── ViewProfile ───────────────────────────────────────────────────────────────
function ViewProfile({ goalie, div, isFounder, canEdit, onClose, onEdit }: {
  goalie: GoalieProfile; div: { bg: string; color: string }
  isFounder: boolean; canEdit: boolean; onClose: () => void; onEdit: () => void
}) {
  return (
    <>
      <div className="relative h-44 flex-shrink-0" style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #112240 50%, rgba(74,127,255,0.2) 100%)',
      }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(74,127,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,127,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>✕</button>
        {isFounder && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider" style={{ background: 'rgba(74,127,255,0.2)', color: '#4a7fff', border: '1px solid rgba(74,127,255,0.4)' }}>
            🏒 Fondateur ANGB
          </div>
        )}
        {canEdit && (
          <button onClick={onEdit}
            className="absolute top-4 right-14 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
            style={{ background: 'rgba(74,127,255,0.2)', color: '#4a7fff', border: '1px solid rgba(74,127,255,0.4)' }}>
            ✏️ Modifier
          </button>
        )}
      </div>

      <div className="px-6 -mt-14 relative z-10 mb-5">
        <div className="w-28 h-28 rounded-full overflow-hidden mb-4 flex items-center justify-center text-2xl font-bold"
          style={{ border: '4px solid #080f1c', boxShadow: '0 0 0 2px rgba(74,127,255,0.5), 0 8px 32px rgba(0,0,0,0.5)', background: 'rgba(74,127,255,0.15)', color: '#4a7fff' }}>
          {goalie.photo_url ? (
            <Image src={goalie.photo_url} alt={goalie.name} width={112} height={112} className="w-full h-full object-cover" />
          ) : ini(goalie.name)}
        </div>
        <h2 className="mb-0.5" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', lineHeight: 1.1 }}>
          {goalie.name}
        </h2>
        {goalie.role_angb && <p className="text-sm font-semibold mb-2" style={{ color: '#4a7fff' }}>{goalie.role_angb}</p>}
        <div className="flex flex-wrap items-center gap-2">
          {goalie.club && <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{goalie.club}</span>}
          {goalie.division && <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: div.bg, color: div.color }}>{goalie.division}</span>}
          {goalie.region && <span className="text-xs" style={{ color: 'var(--gray)' }}>📍 {goalie.region}</span>}
        </div>
      </div>

      <div className="px-6 pb-16 space-y-6">
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

        {goalie.bio_note && (
          <section>
            <STitle icon="📋" label="À propos" />
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{goalie.bio_note}</p>
          </section>
        )}

        {goalie.parcours && goalie.parcours.length > 0 && (
          <section>
            <STitle icon="🏒" label="Parcours hockey" />
            <div className="space-y-2">
              {goalie.parcours.map((e, i) => {
                const edc = dc(e.division)
                return (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#4a7fff', boxShadow: '0 0 6px rgba(74,127,255,0.6)' }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--white)' }}>{e.club}</span>
                        {e.division && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: edc.bg, color: edc.color }}>{e.division}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs" style={{ color: 'var(--gray)' }}>
                        <span>{e.periode}</span>
                        {e.detail && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span><span>{e.detail}</span></>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {goalie.formation && goalie.formation.length > 0 && (
          <section>
            <STitle icon="🎓" label="Formation hockey" />
            <div className="space-y-2">
              {goalie.formation.map((f, i) => (
                <div key={i} className="flex gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-base flex-shrink-0">🎯</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--white)' }}>{f.titre}</p>
                    {(f.organisme || f.annee) && <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>{[f.organisme, f.annee].filter(Boolean).join(' · ')}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {goalie.etudes && goalie.etudes.length > 0 && (
          <section>
            <STitle icon="📚" label="Études" />
            <div className="space-y-2">
              {goalie.etudes.map((e, i) => (
                <div key={i} className="flex gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-base flex-shrink-0">🎓</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--white)' }}>{e.diplome}</p>
                    {(e.ecole || e.annee) && <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>{[e.ecole, e.annee].filter(Boolean).join(' · ')}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {goalie.palmares && goalie.palmares.length > 0 && (
          <section>
            <STitle icon="🏆" label="Palmarès" />
            <div className="space-y-2">
              {goalie.palmares.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm py-1">
                  <span style={{ color: '#f59e0b', flexShrink: 0 }}>★</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)' }}>{p}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {!goalie.bio_note && !goalie.parcours?.length && !goalie.etudes?.length && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--gray)' }}>
            Fiche en cours de complétion.
            {canEdit && <span style={{ color: '#4a7fff' }}> Cliquez sur "Modifier" pour l'enrichir.</span>}
          </p>
        )}
      </div>
    </>
  )
}

// ── EditForm ──────────────────────────────────────────────────────────────────
function EditForm({ goalie, onCancel, onSaved }: {
  goalie: GoalieProfile
  onCancel: () => void
  onSaved: (updated: GoalieProfile) => void
}) {
  const [name,      setName]    = useState(goalie.name)
  const [club,      setClub]    = useState(goalie.club ?? '')
  const [division,  setDiv]     = useState(goalie.division ?? '')
  const [region,    setReg]     = useState(goalie.region ?? '')
  const [bio,       setBio]     = useState(goalie.bio_note ?? '')
  const [parcours,  setParcours]= useState<CareerEntry[]>(goalie.parcours ?? [])
  const [formation, setFormation]= useState<TrainingEntry[]>(goalie.formation ?? [])
  const [etudes,    setEtudes]  = useState<EtudesEntry[]>(goalie.etudes ?? [])
  const [palmares,  setPalmares]= useState<string[]>(goalie.palmares ?? [])
  const [saving,    setSaving]  = useState(false)
  const [err,       setErr]     = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl,  setPhotoUrl]  = useState(goalie.photo_url ?? '')
  const { user } = useAuth()

  const handleSave = async () => {
    if (!name.trim()) { setErr('Le nom est requis.'); return }
    setSaving(true); setErr('')

    let finalPhotoUrl = photoUrl
    if (photoFile && user) {
      const { url, error: upErr } = await uploadGoaliePhoto(user.id, photoFile)
      if (url) { finalPhotoUrl = url; setPhotoUrl(url) }
      else if (upErr) { setErr('Erreur upload photo : ' + upErr); setSaving(false); return }
    }

    const patch = { name, club, division, region, bio_note: bio, parcours, formation, etudes, palmares, photo_url: finalPhotoUrl }
    const { ok, error } = await updateGoalieProfile(goalie.id, patch)
    setSaving(false)
    if (!ok) { setErr(error ?? 'Erreur lors de la sauvegarde.'); return }
    onSaved({ ...goalie, ...patch })
  }

  return (
    <div className="px-6 py-5 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="text-sm flex items-center gap-1" style={{ color: 'var(--gray)' }}>← Retour</button>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {saving ? 'Enregistrement…' : '✓ Enregistrer'}
        </button>
      </div>

      {err && <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(237,41,57,0.12)', color: '#f87171' }}>{err}</div>}

      <div className="space-y-5">
        <PhotoUpload
          currentUrl={photoUrl || null}
          name={name}
          onFileSelect={file => setPhotoFile(file)}
          size={96}
        />

        <EField label="Nom" value={name} onChange={setName} />
        <EField label="Club actuel" value={club} onChange={setClub} placeholder="Montpellier HC" />
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--gray)' }}>Division</label>
          <select value={division} onChange={e => setDiv(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)' }}>
            <option value="">— Sélectionner —</option>
            {DIV_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <EField label="Région" value={region} onChange={setReg} placeholder="Occitanie" />
        <EField label="Bio" value={bio} onChange={setBio} placeholder="Quelques mots sur ton parcours…" />

        <Separator />

        {/* Parcours */}
        <ArraySection
          title="🏒 Parcours hockey"
          items={parcours}
          renderItem={e => `${e.club}${e.division ? ' · ' + e.division : ''}${e.periode ? ' · ' + e.periode : ''}`}
          onRemove={i => setParcours(p => p.filter((_, j) => j !== i))}
          addForm={<CareerForm onAdd={e => setParcours(p => [...p, e])} />}
        />

        {/* Formation */}
        <ArraySection
          title="🎓 Formation hockey"
          items={formation}
          renderItem={f => `${f.titre}${f.organisme ? ' · ' + f.organisme : ''}${f.annee ? ' · ' + f.annee : ''}`}
          onRemove={i => setFormation(f => f.filter((_, j) => j !== i))}
          addForm={<TrainingForm onAdd={e => setFormation(f => [...f, e])} />}
        />

        {/* Études */}
        <ArraySection
          title="📚 Études"
          items={etudes}
          renderItem={e => `${e.diplome}${e.ecole ? ' · ' + e.ecole : ''}${e.annee ? ' · ' + e.annee : ''}`}
          onRemove={i => setEtudes(e => e.filter((_, j) => j !== i))}
          addForm={<EtudesForm onAdd={e => setEtudes(e2 => [...e2, e])} />}
        />

        {/* Palmarès */}
        <ArraySection
          title="🏆 Palmarès"
          items={palmares.map(p => ({ _v: p }))}
          renderItem={p => p._v}
          onRemove={i => setPalmares(p => p.filter((_, j) => j !== i))}
          addForm={<PalmaresForm onAdd={v => setPalmares(p => [...p, v])} />}
        />
      </div>
    </div>
  )
}

// ── Edit sub-components ───────────────────────────────────────────────────────
function EField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--gray)' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--white)' }} />
    </div>
  )
}

function Separator() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
}

function ArraySection<T>({ title, items, renderItem, onRemove, addForm }: {
  title: string; items: T[]; renderItem: (i: T) => string
  onRemove: (i: number) => void; addForm: React.ReactNode
}) {
  const [adding, setAdding] = useState(false)
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4a7fff' }}>{title}</p>
      {items.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs truncate flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{renderItem(item)}</span>
              <button onClick={() => onRemove(i)} className="ml-2 text-xs flex-shrink-0 hover:opacity-60" style={{ color: '#f87171' }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {adding ? (
        <div className="p-3 rounded-xl" style={{ background: 'rgba(74,127,255,0.06)', border: '1px solid rgba(74,127,255,0.2)' }}>
          {/* Wrap addForm to close after add */}
          {typeof addForm === 'object' && addForm !== null
            ? React.cloneElement(addForm as React.ReactElement<{ onAdded?: () => void }>, { onAdded: () => setAdding(false) })
            : addForm}
          <button onClick={() => setAdding(false)} className="mt-2 text-xs" style={{ color: 'var(--gray)' }}>Annuler</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="text-xs font-medium flex items-center gap-1 mt-1 hover:opacity-80" style={{ color: '#4a7fff' }}>
          + Ajouter
        </button>
      )}
    </div>
  )
}

// Import React for cloneElement
import React from 'react'

function CareerForm({ onAdd, onAdded }: { onAdd: (e: CareerEntry) => void; onAdded?: () => void }) {
  const [club, setClub] = useState('')
  const [div,  setDiv]  = useState('')
  const [per,  setPer]  = useState('')
  const [det,  setDet]  = useState('')
  const submit = () => {
    if (!club) return
    onAdd({ club, division: div || undefined, periode: per, detail: det || undefined })
    onAdded?.()
  }
  return (
    <div className="space-y-2">
      <MiniRow label="Club *" value={club} onChange={setClub} />
      <div className="grid grid-cols-2 gap-2">
        <MiniRow label="Division" value={div} onChange={setDiv} placeholder="D2" />
        <MiniRow label="Période" value={per} onChange={setPer} placeholder="2024-2026" />
      </div>
      <MiniRow label="Détail" value={det} onChange={setDet} placeholder="Gardien titulaire" />
      <AddBtn onClick={submit} />
    </div>
  )
}

function TrainingForm({ onAdd, onAdded }: { onAdd: (e: TrainingEntry) => void; onAdded?: () => void }) {
  const [t, setT] = useState(''); const [o, setO] = useState(''); const [a, setA] = useState('')
  const submit = () => { if (!t) return; onAdd({ titre: t, organisme: o || undefined, annee: a || undefined }); onAdded?.() }
  return (
    <div className="space-y-2">
      <MiniRow label="Titre *" value={t} onChange={setT} placeholder="BPJEPS Hockey sur glace" />
      <div className="grid grid-cols-2 gap-2">
        <MiniRow label="Organisme" value={o} onChange={setO} placeholder="FFHG" />
        <MiniRow label="Année" value={a} onChange={setA} placeholder="2022" />
      </div>
      <AddBtn onClick={submit} />
    </div>
  )
}

function EtudesForm({ onAdd, onAdded }: { onAdd: (e: EtudesEntry) => void; onAdded?: () => void }) {
  const [d, setD] = useState(''); const [ec, setEc] = useState(''); const [a, setA] = useState('')
  const submit = () => { if (!d) return; onAdd({ diplome: d, ecole: ec || undefined, annee: a || undefined }); onAdded?.() }
  return (
    <div className="space-y-2">
      <MiniRow label="Diplôme *" value={d} onChange={setD} placeholder="Licence STAPS" />
      <div className="grid grid-cols-2 gap-2">
        <MiniRow label="École" value={ec} onChange={setEc} />
        <MiniRow label="Année" value={a} onChange={setA} placeholder="En cours" />
      </div>
      <AddBtn onClick={submit} />
    </div>
  )
}

function PalmaresForm({ onAdd, onAdded }: { onAdd: (v: string) => void; onAdded?: () => void }) {
  const [v, setV] = useState('')
  const submit = () => { if (!v) return; onAdd(v); onAdded?.(); setV('') }
  return (
    <div className="space-y-2">
      <MiniRow label="Titre" value={v} onChange={setV} placeholder="International France U20" />
      <AddBtn onClick={submit} />
    </div>
  )
}

function MiniRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[10px] mb-1" style={{ color: 'var(--gray)' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--white)' }} />
    </div>
  )
}

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full py-1.5 rounded-lg text-xs font-semibold mt-1"
      style={{ background: 'rgba(74,127,255,0.2)', color: '#4a7fff' }}>
      ✓ Ajouter
    </button>
  )
}

function STitle({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-sm">{icon}</span>
      <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4a7fff' }}>{label}</h3>
    </div>
  )
}

// ── Carte membre ───────────────────────────────────────────────────────────────
function MemberCard({ g, index, owner, onSelect }: {
  g: GoalieProfile; index: number; owner: boolean; onSelect: () => void
}) {
  const dv = dc(g.division)
  const av = AP[index % AP.length]
  return (
    <motion.div whileHover={{ y: -4 }} onClick={onSelect}
      className="p-5 rounded-2xl border cursor-pointer flex flex-col"
      style={{ background: 'var(--navy-mid)', borderColor: g.is_founder ? 'rgba(74,127,255,0.3)' : owner ? 'rgba(74,127,255,0.5)' : 'var(--border)', transition: 'border-color 0.2s' }}>

      <div className="flex justify-end mb-2 gap-1.5 h-5">
        {owner && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,127,255,0.2)', color: '#4a7fff', border: '1px solid rgba(74,127,255,0.4)' }}>Ma fiche</span>}
        {g.is_founder && !owner && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,127,255,0.12)', color: '#4a7fff', border: '1px solid rgba(74,127,255,0.25)' }}>Fondateur</span>}
      </div>

      <div className="flex items-start gap-3.5 mb-3">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-lg font-bold"
          style={{ background: av.bg, color: av.color, border: g.is_founder ? '2px solid rgba(74,127,255,0.3)' : 'none' }}>
          {g.photo_url ? (
            <Image src={g.photo_url} alt={g.name} width={56} height={56} className="w-full h-full object-cover" />
          ) : ini(g.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{g.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>{g.club ?? '—'}</p>
          {g.role_angb && <p className="text-[11px] font-medium mt-0.5" style={{ color: '#4a7fff' }}>{g.role_angb}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {g.division && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: dv.bg, color: dv.color }}>{g.division}</span>}
        {g.region && <span className="text-xs" style={{ color: 'var(--gray)' }}>📍 {g.region}</span>}
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs" style={{ color: 'var(--gray)' }}>
          {owner ? '✏️ Modifier ma fiche' : g.parcours?.length ? 'Fiche complète' : 'Profil'}
        </span>
        <span className="text-xs font-semibold" style={{ color: '#4a7fff' }}>Voir →</span>
      </div>
    </motion.div>
  )
}

// ── Carte d'invitation (section vide) ───────────────────────────────────────────
function InviteCard({ singular, onJoin }: { singular: string; onJoin: () => void }) {
  return (
    <button onClick={onJoin}
      className="w-full p-6 rounded-2xl border border-dashed text-center transition-colors hover:bg-white/5"
      style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
      <p className="text-sm mb-1" style={{ color: 'var(--white)' }}>Aucun {singular} pour l&apos;instant</p>
      <p className="text-xs mb-3" style={{ color: 'var(--gray)' }}>On accueille tout le monde avec plaisir — soyez le premier !</p>
      <span className="text-sm font-semibold" style={{ color: '#4a7fff' }}>Rejoindre l&apos;ANGB →</span>
    </button>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function AnnuairePage() {
  const { user, profile, goalieProfile, linkedGoalies } = useAuth()
  const { openAdhesion } = useAdhesion()
  const [goalies,   setGoalies]  = useState<GoalieProfile[]>([])
  const [loading,   setLoading]  = useState(true)
  const [search,    setSearch]   = useState('')
  const [divFilter, setDiv]      = useState('Toutes')
  const [regFilter, setReg]      = useState('Toutes')
  const [selected,  setSelected] = useState<GoalieProfile | null>(null)

  useEffect(() => {
    getGoalieProfiles().then(d => { setGoalies(d); setLoading(false) })
  }, [])

  const closeDrawer = useCallback(() => setSelected(null), [])

  // Détermine si l'utilisateur peut éditer un profil
  const canEdit = (g: GoalieProfile) => {
    if (!user || !profile) return false
    if (profile.role === 'gardien' && goalieProfile?.id === g.id) return true
    if (profile.role === 'parent' && linkedGoalies.some(l => l.id === g.id)) return true
    return false
  }

  const filtered = goalies.filter(g => {
    const q = search.toLowerCase()
    return (
      (!q || g.name.toLowerCase().includes(q) || (g.club ?? '').toLowerCase().includes(q)) &&
      (divFilter === 'Toutes' || g.division === divFilter) &&
      (regFilter === 'Toutes' || g.region   === regFilter)
    )
  })

  const sorted = [...filtered].sort((a, b) => (b.is_founder ? 1 : 0) - (a.is_founder ? 1 : 0))

  return (
    <div>
      <AnimatePresence>
        {selected && (
          <ProfileDrawer
            goalie={selected}
            onClose={closeDrawer}
            canEdit={canEdit(selected)}
            onSaved={updated => {
              setGoalies(gs => gs.map(g => g.id === updated.id ? updated : g))
              setSelected(updated)
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative overflow-hidden py-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/florian-hardy.jpg" position="center 30%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Annuaire</p>
          <h1 style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em', fontSize: 'clamp(3rem, 8vw, 5rem)' }}>
            Annuaire des membres
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--gray)' }}>
            Gardiens, entraîneurs, joueurs et soutiens de la communauté ANGB · <span style={{ color: '#4a7fff' }}>Cliquez sur une fiche pour en savoir plus</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--gray)' }}>🔍</span>
            <input
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--navy-mid)', color: 'var(--white)', border: '1px solid var(--border)' }}
              placeholder="Rechercher par nom ou club…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={divFilter} onChange={e => setDiv(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--navy-mid)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
            {DIVISIONS.map(d => <option key={d} value={d}>{d === 'Toutes' ? 'Toutes divisions' : d}</option>)}
          </select>
          <select value={regFilter} onChange={e => setReg(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--navy-mid)', color: 'var(--gray)', border: '1px solid var(--border)' }}>
            {REGIONS.map(r => <option key={r} value={r}>{r === 'Toutes' ? 'Toutes régions' : r}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} />)}
          </div>
        ) : (
          <>
            <p className="text-xs mb-6" style={{ color: 'var(--gray)' }}>
              {filtered.length} membre{filtered.length !== 1 ? 's' : ''}
            </p>

            {(() => {
              const isBrowsing = !search && divFilter === 'Toutes' && regFilter === 'Toutes'
              const sections = CATEGORY_SECTIONS
                .map(section => ({ section, members: sorted.filter(g => (g.category ?? 'gardien') === section.key) }))
                .filter(({ members }) => members.length > 0 || isBrowsing)

              if (sections.length === 0) {
                return <p className="text-center py-16 text-sm" style={{ color: 'var(--gray)' }}>Aucun membre trouvé pour ces critères.</p>
              }

              return sections.map(({ section, members }) => (
                <section key={section.key} className="mb-10">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="text-lg">{section.icon}</span>
                    <h2 className="text-xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
                      {section.label}
                    </h2>
                    {members.length > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,127,255,0.12)', color: '#4a7fff' }}>
                        {members.length}
                      </span>
                    )}
                  </div>
                  {members.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {members.map((g, i) => (
                        <MemberCard key={g.id} g={g} index={i} owner={canEdit(g)} onSelect={() => setSelected(g)} />
                      ))}
                    </div>
                  ) : (
                    <InviteCard singular={section.singular} onJoin={openAdhesion} />
                  )}
                </section>
              ))
            })()}
          </>
        )}

        <div className="mt-12 p-4 rounded-xl border-l-4 text-xs" style={{ background: 'rgba(74,127,255,0.05)', borderColor: 'rgba(74,127,255,0.3)', color: 'var(--gray)' }}>
          <strong style={{ color: 'var(--white)' }}>Note de transparence :</strong>{' '}
          L'annuaire n'affiche aucune statistique numérique (SV%, GAA). Informations déclaratives uniquement.
          Les gardiens inscrits gèrent eux-mêmes leur fiche.
        </div>
      </div>
    </div>
  )
}
