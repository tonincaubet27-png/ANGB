export default function StatsSection() {
  const tools = [
    {
      icon: '🗺️',
      title: 'Cartographie nationale',
      desc: "Visualisation géographique de tous les gardiens actifs en France par région, division et club.",
      status: 'En développement',
      color: 'var(--accent)',
    },
    {
      icon: '📊',
      title: 'Métriques ajustées',
      desc: "Des statistiques contextualisées : taux d'arrêts ajusté à la qualité de tirs, nombre de tirs haute-danger, performances en situations de jeu à 5 contre 4.",
      status: 'Définition en cours',
      color: '#c084fc',
    },
    {
      icon: '📈',
      title: 'Outil de suivi progression',
      desc: "Tableau de bord individuel pour les gardiens — suivre son évolution saison après saison sur des critères qualitatifs et quantitatifs.",
      status: 'Roadmap 2027',
      color: '#fb923c',
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2
          className="text-4xl md:text-5xl mb-4"
          style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em' }}
        >
          Statistiques & Analyse
        </h2>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--gray)' }}>
          Le hockey français manque de données sur les gardiens. L'ANGB construit les outils
          pour changer ça — avec une approche rigoureuse et des métriques adaptées au contexte
          hexagonal.
        </p>
      </div>

      <div className="space-y-4">
        {tools.map(({ icon, title, desc, status, color }) => (
          <div
            key={title}
            className="p-6 rounded-2xl border"
            style={{ background: 'var(--navy-mid)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'var(--navy-light)' }}
              >
                {icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--white)' }}>{title}</h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: `${color}20`, color }}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="p-5 rounded-xl"
        style={{ background: 'var(--navy-mid)', border: '1px solid var(--border)' }}
      >
        <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--white)' }}>
          Pourquoi pas de stats individuelles dans l'annuaire ?
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gray)' }}>
          L'ANGB n'affiche pas de statistiques numériques (SV%, GAA, matchs joués) dans l'annuaire
          public car les données du hockey français ne sont pas officiellement centralisées et
          vérifiables. Afficher des chiffres non vérifiés serait préjudiciable pour les gardiens.
          Nous travaillons à créer des outils rigoureux avant toute publication.
        </p>
      </div>
    </div>
  )
}
