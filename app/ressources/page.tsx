import Link from 'next/link'
import HeaderPhoto from '@/components/HeaderPhoto'

export const metadata = {
  title: 'Ressources & documents officiels · ANGB',
  description:
    'Textes réglementaires, protocoles médicaux et guides officiels de la FFHG centralisés pour les gardiens de but.',
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Doc {
  title: string
  description: string
  tag: string
  tagColor: 'red' | 'blue' | 'gray'
  url: string
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SANTE: Doc[] = [
  {
    title: 'CRT 6',
    description:
      "Outil d'évaluation sur le terrain d'une commotion cérébrale. À utiliser immédiatement après un impact suspect.",
    tag: 'Commotion',
    tagColor: 'red',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2024/07/CRT6-français-.pdf',
  },
  {
    title: 'SCAT 6',
    description:
      "Test standardisé de commotion · à utiliser après l'incident pour évaluer l'état du joueur.",
    tag: 'Commotion',
    tagColor: 'red',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2024/07/SCAT6-français-.pdf',
  },
  {
    title: 'Lignes directrices SCAT 6',
    description:
      "Guide complet d'utilisation du SCAT 6 · protocole étape par étape pour le staff médical.",
    tag: 'Commotion',
    tagColor: 'red',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2024/07/Lignes-directrices-SCAT6-.pdf',
  },
  {
    title: 'SCAT 6 · Version enfant',
    description:
      "Adapté aux jeunes gardiens. À utiliser pour toute commotion suspectée chez un joueur mineur.",
    tag: 'Commotion · Jeunes',
    tagColor: 'red',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2024/07/SCAT-6-enfant.pdf',
  },
  {
    title: 'Lignes directrices SCAT 6 enfant',
    description: "Guide d'utilisation de la version enfant du SCAT 6.",
    tag: 'Commotion · Jeunes',
    tagColor: 'red',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2024/07/Lignes-directrices-Child-6-enfant-.pdf',
  },
  {
    title: 'Rapport de commotion cérébrale',
    description:
      "Formulaire officiel de déclaration d'une commotion. À remplir et conserver après chaque incident.",
    tag: 'Commotion',
    tagColor: 'red',
    url: 'https://liguemagnus.com/wp-content/uploads/sites/2/2013/03/RAPPORT_DE_COMMOTION_nov_2018.pdf',
  },
  {
    title: 'Règlement médical FFHG 2025/2026',
    description:
      "Obligations médicales par catégorie, équipement obligatoire pour les gardiens, suivi réglementaire.",
    tag: 'Médical',
    tagColor: 'blue',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2026/01/04-Reglement-medical-2025.26_VF.pdf',
  },
]

const REGLEMENTS: Doc[] = [
  {
    title: 'Règlement des Activités Sportives 2025/2026',
    description:
      "Règles de participation des gardiens entre divisions, brûlages, conditions d'accès aux phases finales.",
    tag: 'Compétition',
    tagColor: 'blue',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2025/06/06-Reglement-AS-2025.26_VF.pdf',
  },
  {
    title: 'Règlement Affiliations – Licences – Mutations 2025/2026',
    description:
      "Conditions de prise de licence, procédures de mutation entre clubs, règles de double licence.",
    tag: 'Licences',
    tagColor: 'blue',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2025/07/07-Reglement-ALM-2025.26_VF.pdf',
  },
  {
    title: 'Règlements généraux Synerglace Ligue Magnus 2025/2026',
    description:
      "Statut des gardiens en Magnus, qualification des joueurs, règles spécifiques à l'élite française.",
    tag: 'Magnus',
    tagColor: 'blue',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2025/09/12-Reglements-generaux-SLM-2025.26-VF.pdf',
  },
  {
    title: 'Directives clubs · Équipement 2023',
    description:
      "Obligations d'équipement par catégorie d'âge, règles spécifiques aux gardiens (protège-dents, certifications).",
    tag: 'Équipement',
    tagColor: 'blue',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2023/08/2023-08-Directives-Club.pdf',
  },
]

const ETHIQUE: Doc[] = [
  {
    title: 'Règlement disciplinaire général FFHG 2026/2027',
    description: "Procédures disciplinaires, échelle des sanctions, droits de la défense.",
    tag: 'Discipline',
    tagColor: 'gray',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2026/05/03-Reglement-disciplinaire-general-2026.27_VF.pdf',
  },
  {
    title: 'Charte éthique et de déontologie FFHG 2025/2026',
    description:
      "Valeurs et engagements éthiques de la fédération · référence pour tous les acteurs du hockey français.",
    tag: 'Éthique',
    tagColor: 'gray',
    url: 'https://www.hockeyfrance.com/wp-content/uploads/2025/05/13-Charte-ethique-et-de-deontologie-2025.26_VF.pdf',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  red:  { bg: 'rgba(237,41,57,0.12)',   color: '#f87171' },
  blue: { bg: 'rgba(74,127,255,0.12)',  color: '#7aa8ff' },
  gray: { bg: 'rgba(255,255,255,0.06)', color: '#8a9ab5' },
}

// ── Composants ────────────────────────────────────────────────────────────────

function PdfIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function DocCard({ doc }: { doc: Doc }) {
  const tag = TAG_STYLES[doc.tagColor]
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-xl transition-colors hover:border-white/10 card-lift"
      style={{
        background: 'var(--navy-mid)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 p-2 rounded-lg flex-shrink-0"
          style={{ background: 'rgba(74,127,255,0.08)', color: '#4a7fff' }}
        >
          <PdfIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--white)' }}>
            {doc.title}
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--gray)' }}>
            {doc.description}
          </p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-3 mt-auto pt-1">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{ background: tag.bg, color: tag.color }}
        >
          {doc.tag}
        </span>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80 flex-shrink-0"
          style={{ color: '#4a7fff' }}
        >
          Télécharger le PDF
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  )
}

function SectionDivider() {
  return (
    <div
      className="my-12"
      style={{ height: 1, background: 'var(--border)' }}
    />
  )
}

function SectionHeader({
  label,
  labelColor = 'blue',
  title,
  intro,
}: {
  label: string
  labelColor?: 'red' | 'blue' | 'gray'
  title: string
  intro: string
}) {
  const lc = TAG_STYLES[labelColor]
  return (
    <div className="mb-8">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded"
        style={{ background: lc.bg, color: lc.color }}
      >
        {label}
      </span>
      <h2
        className="text-3xl md:text-4xl mt-3 mb-3"
        style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.05em' }}
      >
        {title}
      </h2>
      <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--gray)' }}>
        {intro}
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RessourcesPage() {
  return (
    <main style={{ background: 'var(--navy)', minHeight: '100vh' }}>

      {/* ── Page header (bande pleine largeur + photo en fondu) ───────────── */}
      <div className="relative overflow-hidden py-16" style={{ borderBottom: '1px solid var(--border)' }}>
        <HeaderPhoto src="/images/caroline-baldin.jpg" position="center 30%" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-8">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded"
            style={{ background: 'rgba(74,127,255,0.1)', color: '#7aa8ff', border: '1px solid rgba(74,127,255,0.2)' }}
          >
            FFHG · Documents officiels
          </span>
          <h1
            className="text-4xl md:text-6xl mt-4 mb-4"
            style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
          >
            Ressources & documents officiels
          </h1>
          <p className="text-sm md:text-base leading-relaxed max-w-2xl" style={{ color: 'var(--gray)' }}>
            Textes réglementaires, protocoles médicaux et guides officiels de la Fédération Française
            de Hockey sur Glace · centralisés ici pour les gardiens.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* ── Section 1 · Santé ─────────────────────────────────────────────── */}
        <SectionHeader
          label="Priorité ANGB"
          labelColor="red"
          title="Santé du gardien"
          intro="Documents officiels de la FFHG sur la gestion des commotions et le suivi médical. L'ANGB recommande à tout gardien et à tout staff de les connaître et de les avoir accessibles en déplacement."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SANTE.map(doc => <DocCard key={doc.title} doc={doc} />)}
        </div>

        <SectionDivider />

        {/* ── Section 2 · Règlements ────────────────────────────────────────── */}
        <div data-reveal>
          <SectionHeader
            label="Réglementation sportive"
            labelColor="blue"
            title="Règlements FFHG"
            intro="Les textes qui encadrent directement le statut du gardien : participation aux compétitions, licences, mutations entre clubs et conditions spécifiques par division."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REGLEMENTS.map(doc => <DocCard key={doc.title} doc={doc} />)}
          </div>
        </div>

        <SectionDivider />

        {/* ── Section 3 · Éthique ───────────────────────────────────────────── */}
        <div data-reveal>
          <SectionHeader
            label="Cadre institutionnel"
            labelColor="gray"
            title="Éthique & discipline"
            intro="Les textes de référence sur les valeurs, le cadre disciplinaire et les engagements éthiques au sein du hockey français."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ETHIQUE.map(doc => <DocCard key={doc.title} doc={doc} />)}
          </div>
        </div>

        <SectionDivider />

        {/* ── Bloc bas de page ──────────────────────────────────────────────── */}
        <div data-reveal
          className="p-6 md:p-8 rounded-2xl"
          style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h3
                className="text-xl md:text-2xl mb-3"
                style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.05em' }}
              >
                Tous les règlements FFHG
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
                Ces documents sont hébergés et mis à jour par la Fédération Française de Hockey sur Glace.
                L'ANGB les référence ici pour en faciliter l'accès aux gardiens. Les Statuts et Règlement
                intérieur FFHG 2026/2027 sont en cours de publication sur hockeyfrance.com · les versions
                2025/2026 font foi en attendant.
              </p>
            </div>
            <div className="flex-shrink-0">
              <a
                href="https://www.hockeyfrance.com/la-federation/publications-officielles/statuts-et-reglements/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff', whiteSpace: 'nowrap' }}
              >
                Accéder à l'ensemble des règlements FFHG
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
