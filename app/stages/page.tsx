'use client'

import { useState } from 'react'
import Image from 'next/image'
import HeaderPhoto from '@/components/HeaderPhoto'
import { useAdhesion } from '@/contexts/AdhesionContext'

// ── Données stages (EXEMPLES de l'académie · à remplacer par les vrais) ─────────
interface Stage {
  id: string
  titre: string
  organisateur: string
  periode: string        // libellé lisible
  dateDebut: string      // ISO, pour trier / filtrer à venir
  lieu: string
  public: string         // ex. « Gardiens U13 à U20 »
  niveau: string         // ex. « Tous niveaux »
  tarif: string
  places?: string
  description: string
  image: string
  lien?: string          // lien d'inscription
}

const ACADEMIE = 'Académie du Hockey'
const ACADEMIE_URL = 'https://academieduhockey.com'

const STAGES: Stage[] = [
  {
    id: '1', titre: 'Stage Jeunes · Pralognan', organisateur: ACADEMIE,
    periode: 'Été · juillet 2026', dateDebut: '2026-07-06',
    lieu: 'Pralognan-la-Vanoise', public: 'U9 à U15 · filles & garçons', niveau: 'Programme spécifique gardiens',
    tarif: 'Voir le site', places: '2 sessions : 6-11 & 13-18 juillet (ou 2 semaines)',
    description: 'Stage estival de développement et de perfectionnement, en altitude, avec un programme dédié aux gardiens de but. Groupes par âge et par niveau.',
    image: '/images/florian-hardy.jpg', lien: ACADEMIE_URL,
  },
  {
    id: '2', titre: 'Skills Days · Meudon', organisateur: ACADEMIE,
    periode: 'Skills Days · juin 2026', dateDebut: '2026-06-09',
    lieu: 'Patinoire de Meudon', public: 'U11 à U18 + loisirs adultes', niveau: 'Joueurs & gardiens',
    tarif: 'Voir le site', places: 'Groupes gardiens U11/U13/U15/U18',
    description: 'Journées « skills » de travail technique intensif, avec des groupes gardiens dédiés à chaque catégorie d’âge et un groupe loisirs adultes.',
    image: '/images/hardy.jpg', lien: ACADEMIE_URL,
  },
  {
    id: '3', titre: 'Loisirs Adultes · Vaujany', organisateur: ACADEMIE,
    periode: 'Loisirs adultes · mai 2026', dateDebut: '2026-05-22',
    lieu: 'Vaujany', public: 'Adultes loisirs', niveau: 'Programme gardiens inclus',
    tarif: 'Voir le site', places: '22-25 mai 2026',
    description: 'Stage loisirs pour adultes, glace et perfectionnement dans un cadre montagnard, avec un programme spécifique pour les gardiens.',
    image: '/images/fabrice-lhenry.jpg', lien: ACADEMIE_URL,
  },
]

const fmt = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// ── Carte stage ────────────────────────────────────────────────────────────────
function StageCard({ s }: { s: Stage }) {
  const passed = new Date(s.dateDebut).getTime() < Date.now()
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col card-lift" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
      <div className="relative h-44">
        <Image src={s.image} alt={s.titre} fill className="object-cover" sizes="(max-width:768px) 100vw, 380px" style={{ filter: passed ? 'grayscale(60%) opacity(0.6)' : 'none' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1" style={{ background: '#002395' }} />
          <div className="flex-1" style={{ background: '#fff' }} />
          <div className="flex-1" style={{ background: '#ED2939' }} />
        </div>
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
          style={{ background: passed ? 'rgba(139,160,181,0.85)' : 'rgba(0,35,149,0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
          {passed ? 'Terminé' : 'À venir'}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#9db4ff' }}>{s.periode}</p>
          <h3 className="text-2xl" style={{ fontFamily: 'var(--font-bebas)', color: '#fff', letterSpacing: '0.03em', lineHeight: 1 }}>{s.titre}</h3>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-3">
          <Info icon="📅" label="Dates" value={fmt(s.dateDebut)} />
          <Info icon="📍" label="Lieu" value={s.lieu} />
          <Info icon="🥅" label="Public" value={s.public} />
          <Info icon="📈" label="Niveau" value={s.niveau} />
          <Info icon="💶" label="Tarif" value={s.tarif} />
          {s.places && <Info icon="🎟️" label="Places" value={s.places} />}
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--gray)' }}>{s.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-xs" style={{ color: 'var(--gray)' }}>Organisé par {s.organisateur}</span>
          <a href={s.lien || ACADEMIE_URL} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5"
            style={{ background: passed ? 'rgba(255,255,255,0.08)' : 'var(--accent)', border: passed ? '1px solid var(--border-mid)' : 'none', boxShadow: passed ? 'none' : '0 4px 16px rgba(74,127,255,0.3)' }}>
            {passed ? 'Plus d’infos →' : 'S’inscrire →'}
          </a>
        </div>
      </div>
    </div>
  )
}

function Info({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--gray)' }}>{icon} {label}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.85)' }}>{value}</p>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function StagesPage() {
  const { openAdhesion } = useAdhesion()
  const [tab, setTab] = useState<'avenir' | 'tous'>('avenir')

  const sorted = [...STAGES].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
  const list = tab === 'tous' ? sorted : sorted.filter(s => new Date(s.dateDebut).getTime() >= Date.now())

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden py-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/florian-hardy.jpg" position="center 30%" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <span className="overline-fr mb-3 inline-block">Formation sur la glace</span>
          <h1 className="text-5xl md:text-7xl" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Stages gardiens
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--gray)' }}>
            Stages et camps de perfectionnement pour gardiens de but, encadrés par des entraîneurs spécialisés.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Note programme */}
        <div className="flex items-start gap-3 p-4 rounded-xl mb-6" style={{ background: 'rgba(74,127,255,0.06)', border: '1px solid rgba(74,127,255,0.25)' }}>
          <span className="text-lg flex-shrink-0">ℹ️</span>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>
            Stages proposés par l&apos;<strong style={{ color: 'var(--white)' }}>{ACADEMIE}</strong>. Tarifs, horaires et
            inscriptions (toutes les infos à jour) sur{' '}
            <a href={ACADEMIE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: 'var(--accent)' }}>academieduhockey.com</a>.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          {([['avenir', 'À venir'], ['tous', 'Tous les stages']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.08em] transition-colors"
              style={{
                background: tab === k ? 'rgba(74,127,255,0.15)' : 'var(--navy-mid)',
                border: `1px solid ${tab === k ? 'rgba(74,127,255,0.5)' : 'var(--border)'}`,
                color: tab === k ? '#4a7fff' : 'var(--gray)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {list.length === 0 ? (
          <div className="p-12 text-center rounded-2xl" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
            <div className="text-3xl mb-2 opacity-40">🥅</div>
            <p className="text-sm" style={{ color: 'var(--gray)' }}>Aucun stage à venir pour le moment · reviens bientôt !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map(s => <StageCard key={s.id} s={s} />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl p-8 text-center" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}>
          <h3 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}>
            Tu organises un stage gardiens ?
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--gray)' }}>
            Membres et structures de l&apos;ANGB peuvent proposer leurs stages ici. Contacte le bureau pour l&apos;ajouter.
          </p>
          <button onClick={openAdhesion}
            className="px-8 py-3.5 rounded-xl text-sm font-extrabold uppercase tracking-[0.1em] text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'var(--accent)', boxShadow: '0 6px 24px rgba(74,127,255,0.3)' }}>
            Rejoindre l&apos;ANGB
          </button>
        </div>
      </div>
    </div>
  )
}
