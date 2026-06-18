export default function SanteSection() {
  const stats = [
    { value: '67%', label: 'jouent blessés', sub: 'douleur chronique ou aiguë non diagnostiquée' },
    { value: '3×', label: 'plus de risque commotion', sub: 'vs joueurs de champ, à surface de jeu égale' },
    { value: '1 200+', label: 'contacts sol/saison', sub: 'genoux, hanches, épaules · chutes répertoriées' },
  ]

  const risks = [
    {
      zone: 'Genoux',
      icon: '🦵',
      level: 'danger',
      desc: "Papillon profond répété → contrainte ligamentaire extrême. MCL, LCA et ménisques sous pression constante.",
    },
    {
      zone: 'Hanches',
      icon: '🦴',
      level: 'danger',
      desc: "Rotation externe maximale en position de base → conflits fémoroacétabulaires fréquents, arthrose précoce.",
    },
    {
      zone: 'Tête / Cou',
      icon: '🧠',
      level: 'danger',
      desc: "Tirs direct à 150+ km/h, contacts accidentels avec la glace ou les poteaux. Risque commotionnel sous-estimé.",
    },
    {
      zone: 'Épaules',
      icon: '💪',
      level: 'warn',
      desc: "Chutes répétées sur l'épaule dominante. Instabilité glénohumérale progressive.",
    },
    {
      zone: 'Adducteurs',
      icon: '🩻',
      level: 'warn',
      desc: "Écarts latéraux en urgence répétés → pubalgie et déchirures musculaires récurrentes.",
    },
    {
      zone: 'Santé mentale',
      icon: '🧘',
      level: 'ok',
      desc: "Pression du dernier rempart, isolement du poste, charge émotionnelle des buts encaissés. Souvent négligée.",
    },
  ]

  const conseils = [
    {
      num: '01',
      title: 'Mobilité des hanches quotidienne',
      desc: "90/90 stretch, mobilisation fémoroacétabulaire, étirements piriforme. Minimum 15 min/jour hors glace.",
    },
    {
      num: '02',
      title: 'Protocole commotion ANGB',
      desc: "Tout choc à la tête = sortie immédiate + évaluation médicale avant tout retour au jeu. Sans exception.",
    },
    {
      num: '03',
      title: 'Renforcement adducteurs / core',
      desc: "Copenhagen planks, side-lying hip adduction, anti-rotation core. Prévention active de la pubalgie.",
    },
    {
      num: '04',
      title: 'Récupération post-match',
      desc: "Bain froid (12°C, 10 min) ou contraste chaud/froid. Sommeil prioritaire sur la nutrition post-effort.",
    },
    {
      num: '05',
      title: 'Santé mentale proactive',
      desc: "Routine de débriefing visuel positif. L'ANGB recommande un accès à un préparateur mental qualifié.",
    },
    {
      num: '06',
      title: 'Équipement adapté',
      desc: "Protège-gorge intégré obligatoire. Jambières ajustées à la morphologie pour ne pas forcer le papillon.",
    },
  ]

  const levelStyle = (level: string) => {
    if (level === 'danger') return { bg: 'rgba(237,41,57,0.1)', border: 'rgba(237,41,57,0.4)', badge: 'Priorité haute', color: 'var(--red-fr)' }
    if (level === 'warn') return { bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.3)', badge: 'Surveillance', color: '#fb923c' }
    return { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.3)', badge: 'Vigilance', color: '#34d399' }
  }

  return (
    <div className="space-y-12">
      {/* Stats réalité */}
      <div>
        <h2
          className="text-4xl md:text-5xl mb-2"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          La réalité du poste
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--gray)' }}>
          Des chiffres qui parlent · et qui justifient une approche santé dédiée.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(({ value, label, sub }) => (
            <div
              key={label}
              className="p-6 rounded-2xl text-center border"
              style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
            >
              <p
                className="text-5xl mb-1"
                style={{ fontFamily: 'var(--font-bebas)', color: 'var(--red-fr)', letterSpacing: '0.02em' }}
              >
                {value}
              </p>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--white)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risques par zone */}
      <div>
        <h3
          className="text-2xl mb-6"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          6 risques spécifiques
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {risks.map(({ zone, icon, level, desc }) => {
            const s = levelStyle(level)
            return (
              <div
                key={zone}
                className="p-5 rounded-2xl border"
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{zone}</h4>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: `${s.color}20`, color: s.color }}
                  >
                    {s.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Conseils */}
      <div>
        <h3
          className="text-2xl mb-6"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          6 conseils pratiques
        </h3>
        <div className="space-y-3">
          {conseils.map(({ num, title, desc }) => (
            <div
              key={num}
              className="flex gap-4 p-5 rounded-xl border"
              style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
            >
              <span
                className="text-2xl flex-shrink-0 w-10"
                style={{ fontFamily: 'var(--font-bebas)', color: 'var(--accent)', letterSpacing: '0.05em' }}
              >
                {num}
              </span>
              <div>
                <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--white)' }}>{title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
