'use client'

import { useState } from 'react'
import { submitAdhesion } from '@/lib/data'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const DIVISIONS_SENIORS = ['Magnus', 'D1', 'D2', 'D3', 'Féminine']
const DIVISIONS_JEUNES  = ['U21', 'U18', 'U15', 'U13', 'U11', 'U9', 'U7', 'École de hockey']
const DIVISIONS_AUTRES  = ['Loisir', 'Sans club']

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  nom: string
  prenom: string
  date_naissance: string
  telephone: string
  email: string
  adresse: string
  club: string
  statut: string[]   // multi-sélection
  division: string
  categorie_enfant: string   // optionnel — visible si statut === 'parent'
  cotisation: string
  accept_statuts: boolean
  accept_rgpd: boolean
  autorisation_image: boolean
}

const emptyForm: FormData = {
  nom: '',
  prenom: '',
  date_naissance: '',
  telephone: '',
  email: '',
  adresse: '',
  club: '',
  statut: [],
  division: '',
  categorie_enfant: '',
  cotisation: '',
  accept_statuts: false,
  accept_rgpd: false,
  autorisation_image: false,
}

export default function AdhesionModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  // Bascule un statut dans le tableau (toggle multi-sélection)
  const toggleStatut = (value: string) => {
    setForm(prev => ({
      ...prev,
      statut: prev.statut.includes(value)
        ? prev.statut.filter(s => s !== value)
        : [...prev.statut, value],
    }))
    setErrors(prev => ({ ...prev, statut: undefined }))
  }

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (step === 1) {
      if (!form.nom.trim()) newErrors.nom = 'Requis'
      if (!form.prenom.trim()) newErrors.prenom = 'Requis'
      if (!form.email.trim()) newErrors.email = 'Requis'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email invalide'
      if (!form.date_naissance) newErrors.date_naissance = 'Requis'
    }
    if (step === 2) {
      if (form.statut.length === 0) newErrors.statut = 'Sélectionne au moins un statut'
    }
    if (step === 3) {
      if (!form.cotisation) newErrors.cotisation = 'Requis'
    }
    if (step === 4) {
      if (!form.accept_statuts) newErrors.accept_statuts = 'Vous devez accepter les statuts et le règlement intérieur'
      if (!form.accept_rgpd) newErrors.accept_rgpd = 'Vous devez accepter la politique RGPD'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const next = () => {
    if (validateStep()) setStep(s => (s < 5 ? ((s + 1) as Step) : s))
  }

  const prev = () => setStep(s => (s > 1 ? ((s - 1) as Step) : s))

  const submit = async () => {
    if (!validateStep()) return
    await submitAdhesion({
      nom:               form.nom,
      prenom:            form.prenom,
      date_naissance:    form.date_naissance || null,
      telephone:         form.telephone || null,
      email:             form.email,
      adresse:           form.adresse || null,
      club:              form.club || null,
      statut:            form.statut.length > 0 ? form.statut.join(', ') : null,
      division:          form.division || null,
      cotisation:        form.cotisation || null,
      accept_statuts:    form.accept_statuts,
      accept_rgpd:       form.accept_rgpd,
      autorisation_image: form.autorisation_image,
    })
    setSubmitted(true)
  }

  const handleClose = () => {
    setStep(1)
    setForm(emptyForm)
    setErrors({})
    setSubmitted(false)
    onClose()
  }

  const inputCls = (field: keyof FormData) =>
    `w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors border ${
      errors[field]
        ? 'border-red-400'
        : 'border-transparent focus:border-accent'
    }`

  const stepLabels = ['Identité', 'Hockey', 'Cotisation', 'Engagements', 'Confirmation']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 pt-6 pb-4" style={{ background: 'var(--navy-mid)' }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl tracking-widest" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)' }}>
                Bulletin d'adhésion
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
                Association Nationale des Gardiens de But
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg transition-colors hover:bg-white/10 text-lg"
              style={{ color: 'var(--gray)' }}
            >
              ✕
            </button>
          </div>

          {/* Progress steps */}
          {!submitted && (
            <div className="flex gap-1">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="h-1 rounded-full mb-1 transition-colors"
                    style={{ background: i + 1 <= step ? 'var(--accent)' : 'var(--navy-light)' }}
                  />
                  <p className="text-[10px] text-center truncate" style={{ color: i + 1 === step ? 'var(--white)' : 'var(--gray)' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* SUCCESS */}
          {submitted ? (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ background: 'rgba(74,127,255,0.15)' }}
              >
                ✓
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--white)' }}>
                Demande envoyée !
              </h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--gray)' }}>
                Le bureau de l'ANGB reviendra vers vous à l'adresse{' '}
                <strong style={{ color: 'var(--white)' }}>{form.email}</strong> pour finaliser votre adhésion.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}
              >
                Fermer
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1 — Identité */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--white)' }}>
                    1 · Informations personnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Prénom *" error={errors.prenom}>
                      <input
                        className={inputCls('prenom')}
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={form.prenom}
                        onChange={e => set('prenom', e.target.value)}
                        placeholder="Tonin"
                      />
                    </Field>
                    <Field label="Nom *" error={errors.nom}>
                      <input
                        className={inputCls('nom')}
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={form.nom}
                        onChange={e => set('nom', e.target.value)}
                        placeholder="Caubet"
                      />
                    </Field>
                  </div>
                  <Field label="Date de naissance *" error={errors.date_naissance}>
                    <input
                      type="date"
                      className={inputCls('date_naissance')}
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.date_naissance}
                      onChange={e => set('date_naissance', e.target.value)}
                    />
                  </Field>
                  <Field label="Email *" error={errors.email}>
                    <input
                      type="email"
                      className={inputCls('email')}
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="gardien@club.fr"
                    />
                  </Field>
                  <Field label="Téléphone" error={errors.telephone}>
                    <input
                      type="tel"
                      className={inputCls('telephone')}
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.telephone}
                      onChange={e => set('telephone', e.target.value)}
                      placeholder="06 00 00 00 00"
                    />
                  </Field>
                  <Field label="Adresse postale" error={errors.adresse}>
                    <input
                      className={inputCls('adresse')}
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.adresse}
                      onChange={e => set('adresse', e.target.value)}
                      placeholder="12 rue du hockey, 75001 Paris"
                    />
                  </Field>
                </div>
              )}

              {/* STEP 2 — Profil hockey */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--white)' }}>
                    2 · Profil hockey
                  </h3>
                  <Field label="Club actuel" error={errors.club}>
                    <input
                      className={inputCls('club')}
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.club}
                      onChange={e => set('club', e.target.value)}
                      placeholder="Rouen Dragons"
                    />
                  </Field>
                  <Field label="Statut * (plusieurs choix possibles)" error={errors.statut}>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'gardien_actif',      label: 'Gardien actif' },
                        { value: 'ancien_gardien',     label: 'Ancien gardien' },
                        { value: 'entraineur_gardien', label: 'Entraîneur gardien' },
                        { value: 'parent',             label: 'Parent / tuteur' },
                        { value: 'membre_soutien',     label: 'Membre soutien' },
                      ].map(opt => {
                        const selected = form.statut.includes(opt.value)
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleStatut(opt.value)}
                            className="px-3 py-2.5 rounded-lg text-sm text-left transition-all border flex items-center gap-2"
                            style={{
                              background: selected ? 'rgba(74,127,255,0.15)' : 'var(--navy-light)',
                              borderColor: selected ? 'var(--accent)' : 'transparent',
                              color: selected ? 'var(--white)' : 'var(--gray)',
                            }}
                          >
                            <span
                              className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[10px]"
                              style={{
                                background: selected ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                              }}
                            >
                              {selected ? '✓' : ''}
                            </span>
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </Field>
                  <Field label="Division / niveau" error={errors.division}>
                    <select
                      className={inputCls('division')}
                      style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                      value={form.division}
                      onChange={e => set('division', e.target.value)}
                    >
                      <option value="">Choisir une division</option>
                      <optgroup label="Compétitions seniors">
                        {DIVISIONS_SENIORS.map(d => <option key={d} value={d}>{d}</option>)}
                      </optgroup>
                      <optgroup label="Catégories jeunes">
                        {DIVISIONS_JEUNES.map(d => <option key={d} value={d}>{d}</option>)}
                      </optgroup>
                      <optgroup label="Autre">
                        {DIVISIONS_AUTRES.map(d => <option key={d} value={d}>{d}</option>)}
                      </optgroup>
                    </select>
                  </Field>

                  {/* Champ optionnel pour les parents : catégorie de l'enfant */}
                  {form.statut.includes('parent') && (
                    <Field label="Catégorie de l'enfant (optionnel)" error={errors.categorie_enfant}>
                      <select
                        className={inputCls('categorie_enfant')}
                        style={{ background: 'var(--navy-light)', color: 'var(--white)' }}
                        value={form.categorie_enfant}
                        onChange={e => set('categorie_enfant', e.target.value)}
                      >
                        <option value="">Choisir une catégorie</option>
                        <optgroup label="Catégories jeunes">
                          {DIVISIONS_JEUNES.map(d => <option key={d} value={d}>{d}</option>)}
                        </optgroup>
                        <optgroup label="Compétitions seniors">
                          {DIVISIONS_SENIORS.map(d => <option key={d} value={d}>{d}</option>)}
                        </optgroup>
                      </select>
                    </Field>
                  )}
                </div>
              )}

              {/* STEP 3 — Cotisation */}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--white)' }}>
                    3 · Cotisation
                  </h3>
                  {errors.cotisation && (
                    <p className="text-xs" style={{ color: 'var(--red-fr)' }}>{errors.cotisation}</p>
                  )}
                  {[
                    {
                      value: 'actif_20',
                      label: 'Membre actif',
                      price: '20€ / an',
                      desc: 'Droit de vote en AG — gardiens et anciens gardiens',
                      color: 'var(--accent)',
                    },
                    {
                      value: 'soutien_10',
                      label: 'Membre soutien',
                      price: '10€ / an',
                      desc: 'Clubs, structures, professionnels de santé, parents',
                      color: '#a78bfa',
                    },
                    {
                      value: 'gratuit_0',
                      label: 'Gratuité de lancement',
                      price: '0€',
                      desc: 'Mineurs, étudiants, membres du bureau — exonération sur justificatif',
                      color: '#34d399',
                    },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('cotisation', opt.value)}
                      className="w-full px-4 py-3 rounded-xl text-left transition-all border"
                      style={{
                        background: form.cotisation === opt.value ? 'rgba(74,127,255,0.08)' : 'var(--navy-light)',
                        borderColor: form.cotisation === opt.value ? opt.color : 'transparent',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm" style={{ color: 'var(--white)' }}>
                          {opt.label}
                        </span>
                        <span className="font-bold text-base" style={{ fontFamily: 'var(--font-bebas)', color: opt.color, letterSpacing: '0.05em' }}>
                          {opt.price}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--gray)' }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 4 — Engagements */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--white)' }}>
                    4 · Engagements
                  </h3>

                  <CheckboxField
                    checked={form.accept_statuts}
                    onChange={v => set('accept_statuts', v)}
                    error={errors.accept_statuts}
                    required
                  >
                    J'accepte les{' '}
                    <a href="#" className="underline" style={{ color: 'var(--accent)' }}>statuts</a>
                    {' '}et le{' '}
                    <a href="#" className="underline" style={{ color: 'var(--accent)' }}>règlement intérieur</a>
                    {' '}de l'ANGB *
                  </CheckboxField>

                  <CheckboxField
                    checked={form.accept_rgpd}
                    onChange={v => set('accept_rgpd', v)}
                    error={errors.accept_rgpd}
                    required
                  >
                    Je consens au traitement de mes données personnelles conformément au RGPD.
                    Les données sont limitées à la gestion des adhésions et ne seront jamais transmises à des tiers *
                  </CheckboxField>

                  <CheckboxField
                    checked={form.autorisation_image}
                    onChange={v => set('autorisation_image', v)}
                  >
                    J'autorise l'ANGB à utiliser mon nom et mon image dans ses communications officielles
                    (facultatif)
                  </CheckboxField>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                {step > 1 && (
                  <button
                    onClick={prev}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border"
                    style={{ borderColor: 'var(--border)', color: 'var(--gray)', background: 'transparent' }}
                  >
                    Retour
                  </button>
                )}
                {step < 4 ? (
                  <button
                    onClick={next}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)' }}
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)' }}
                  >
                    Envoyer ma demande d'adhésion
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--gray)' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: 'var(--red-fr)' }}>{error}</p>}
    </div>
  )
}

function CheckboxField({
  checked,
  onChange,
  error,
  required,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="flex gap-3 cursor-pointer">
        <div className="mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            className="sr-only"
          />
          <div
            onClick={() => onChange(!checked)}
            className="w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer"
            style={{
              background: checked ? 'var(--accent)' : 'var(--navy-light)',
              borderColor: error ? 'var(--red-fr)' : checked ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
            }}
          >
            {checked && <span className="text-white text-xs">✓</span>}
          </div>
        </div>
        <span className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
          {children}
        </span>
      </label>
      {error && <p className="text-xs mt-1 ml-8" style={{ color: 'var(--red-fr)' }}>{error}</p>}
    </div>
  )
}
