'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { updateGoalieProfile, uploadGoaliePhoto } from '@/lib/data'
import PhotoUpload from '@/components/PhotoUpload'

const DIVISIONS = ['', 'Magnus', 'D1', 'D2', 'D3', 'Féminine Élite', 'Régionale']

export default function ProfilPage() {
  const { user, goalieProfile, isMember, loading, openAuth, refreshProfile } = useAuth()

  const [editing, setEditing]   = useState(false)
  const [name, setName]         = useState('')
  const [club, setClub]         = useState('')
  const [division, setDivision] = useState('')
  const [region, setRegion]     = useState('')
  const [bio, setBio]           = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [gallery, setGallery]   = useState<string[]>([])
  const [saving, setSaving]     = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!goalieProfile) return
    setName(goalieProfile.name ?? '')
    setClub(goalieProfile.club ?? '')
    setDivision(goalieProfile.division ?? '')
    setRegion(goalieProfile.region ?? '')
    setBio(goalieProfile.bio_note ?? '')
    setPhotoUrl(goalieProfile.photo_url ?? '')
    setGallery(goalieProfile.gallery ?? [])
  }, [goalieProfile])

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20"><div className="h-72 rounded-2xl animate-pulse" style={{ background: 'var(--navy-mid)' }} /></div>
  }
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-lg mb-4" style={{ color: 'var(--white)' }}>Connecte-toi pour accéder à ton profil</p>
        <button onClick={() => openAuth('login')} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>Se connecter</button>
      </div>
    )
  }
  if (!goalieProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-lg mb-2" style={{ color: 'var(--white)' }}>Profil en préparation</p>
        <p className="text-sm" style={{ color: 'var(--gray)' }}>Ta fiche sera disponible une fois ton adhésion enregistrée par le bureau.</p>
      </div>
    )
  }

  const g = goalieProfile
  const initials = (name || g.name).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const handleGalleryAdd = async (files: FileList | null) => {
    if (!files || !user) return
    setUploadingGallery(true)
    const urls: string[] = []
    for (const f of Array.from(files)) {
      const { url } = await uploadGoaliePhoto(user.id, f)
      if (url) urls.push(url)
    }
    setGallery(prev => [...prev, ...urls])
    setUploadingGallery(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    setSaving(true)
    let finalPhoto = photoUrl
    if (photoFile && user) {
      const { url } = await uploadGoaliePhoto(user.id, photoFile)
      if (url) finalPhoto = url
    }
    await updateGoalieProfile(g.id, { name, club, division, region, bio_note: bio, photo_url: finalPhoto, gallery })
    await refreshProfile()
    setPhotoUrl(finalPhoto)
    setPhotoFile(null)
    setSaving(false)
    setEditing(false)
  }

  const handleCancel = () => {
    setName(g.name ?? ''); setClub(g.club ?? ''); setDivision(g.division ?? '')
    setRegion(g.region ?? ''); setBio(g.bio_note ?? ''); setPhotoUrl(g.photo_url ?? '')
    setGallery(g.gallery ?? []); setPhotoFile(null); setEditing(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>

        {/* ── Bannière ─────────────────────────────────────────────────── */}
        <div className="relative h-36" style={{ background: 'linear-gradient(120deg, #0a1628 0%, #112240 45%, rgba(74,127,255,0.35) 100%)' }}>
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-0 left-0 right-0 h-[3px] flex">
            <div className="flex-1" style={{ background: '#002395' }} />
            <div className="flex-1" style={{ background: '#fff' }} />
            <div className="flex-1" style={{ background: '#ED2939' }} />
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="absolute top-3 right-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
              ✏️ Modifier
            </button>
          )}
        </div>

        {/* ── Identité ─────────────────────────────────────────────────── */}
        <div className="px-6 md:px-8 -mt-12 relative">
          {editing ? (
            <PhotoUpload currentUrl={photoUrl || null} name={name} onFileSelect={f => setPhotoFile(f)} size={96} />
          ) : (
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold"
              style={{ border: '4px solid var(--navy-mid)', background: 'rgba(74,127,255,0.15)', color: '#4a7fff' }}>
              {photoUrl ? <Image src={photoUrl} alt={name} width={96} height={96} className="w-full h-full object-cover" /> : initials}
            </div>
          )}

          <div className="mt-3">
            {editing ? (
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ton nom"
                className="w-full text-2xl font-bold px-3 py-2 rounded-lg outline-none mb-2"
                style={{ background: 'var(--navy-light)', color: 'var(--white)' }} />
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.03em' }}>{name}</h1>
                {isMember
                  ? <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>✓ Membre</span>
                  : <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>⏳ En attente</span>}
              </div>
            )}

            {/* Club / division / région */}
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                <input value={club} onChange={e => setClub(e.target.value)} placeholder="Club"
                  className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--navy-light)', color: 'var(--white)' }} />
                <select value={division} onChange={e => setDivision(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--navy-light)', color: 'var(--white)' }}>
                  {DIVISIONS.map(d => <option key={d} value={d}>{d || 'Division…'}</option>)}
                </select>
                <input value={region} onChange={e => setRegion(e.target.value)} placeholder="Région"
                  className="px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--navy-light)', color: 'var(--white)' }} />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {club && <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{club}</span>}
                {division && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,127,255,0.15)', color: '#4a7fff' }}>{division}</span>}
                {region && <span className="text-xs" style={{ color: 'var(--gray)' }}>📍 {region}</span>}
                {!club && !division && !region && <span className="text-xs italic" style={{ color: 'var(--gray)' }}>Aucune info club — clique « Modifier »</span>}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="mt-4">
            {editing ? (
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Ta bio — quelques mots sur toi, ton poste, ton style…"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: 'var(--navy-light)', color: 'var(--white)' }} />
            ) : (
              bio
                ? <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{bio}</p>
                : <p className="text-sm italic" style={{ color: 'var(--gray)' }}>Pas encore de bio.</p>
            )}
          </div>

          {/* Actions édition */}
          {editing && (
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--accent)' }}>
                {saving ? 'Enregistrement…' : '✓ Enregistrer'}
              </button>
              <button onClick={handleCancel} className="px-5 py-2 rounded-xl text-sm font-medium" style={{ color: 'var(--gray)', border: '1px solid var(--border)' }}>
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* ── Galerie photos ───────────────────────────────────────────── */}
        <div className="px-6 md:px-8 mt-7 pb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4a7fff' }}>📸 Photos</h2>
            {editing && (
              <button onClick={() => fileRef.current?.click()} disabled={uploadingGallery}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
                style={{ background: 'rgba(74,127,255,0.15)', color: '#4a7fff' }}>
                {uploadingGallery ? 'Envoi…' : '+ Ajouter des photos'}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleGalleryAdd(e.target.files)} />
          </div>

          {gallery.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--gray)' }}>
              {editing ? 'Ajoute tes photos de hockey (matchs, équipement, entraînements…).' : 'Aucune photo pour l’instant.'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden" style={{ background: 'var(--navy-light)' }}>
                  <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="200px" />
                  {editing && (
                    <button onClick={() => setGallery(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Parcours détaillé (édité dans l'annuaire) ───────────────────── */}
      <div className="mt-4 p-5 rounded-2xl flex items-center justify-between gap-4" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--white)' }}>Parcours, formation & expériences</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
            {[g.parcours?.length && `${g.parcours.length} étapes`, g.experiences?.length && `${g.experiences.length} expériences`, g.etudes?.length && `${g.etudes.length} diplômes`]
              .filter(Boolean).join(' · ') || 'À compléter'}
          </p>
        </div>
        <Link href="/annuaire" className="text-sm font-semibold flex-shrink-0" style={{ color: '#4a7fff' }}>Détailler →</Link>
      </div>

      <p className="text-center mt-6">
        <Link href="/annuaire" className="text-xs" style={{ color: 'var(--gray)' }}>Voir ma fiche publique dans l’annuaire →</Link>
      </p>
    </div>
  )
}
