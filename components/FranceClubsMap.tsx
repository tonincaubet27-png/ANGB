'use client'

import { useEffect, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'

// ── Clubs (liste indicative — divisions ~saison 2024/25, à compléter/corriger) ──
type Division = 'Magnus' | 'D1' | 'D2' | 'D3'
interface Club { name: string; city: string; division: Division; coords: [number, number] } // [lng, lat]

const CLUBS: Club[] = [
  // Ligue Magnus
  { name: 'Rouen Dragons',        city: 'Rouen',           division: 'Magnus', coords: [1.0993, 49.4432] },
  { name: 'Brûleurs de Loups',    city: 'Grenoble',        division: 'Magnus', coords: [5.7245, 45.1885] },
  { name: 'Ducs d’Angers',        city: 'Angers',          division: 'Magnus', coords: [-0.5632, 47.4784] },
  { name: 'Boxers de Bordeaux',   city: 'Bordeaux',        division: 'Magnus', coords: [-0.5792, 44.8378] },
  { name: 'Gothiques d’Amiens',   city: 'Amiens',          division: 'Magnus', coords: [2.2957, 49.8941] },
  { name: 'Jokers de Cergy',      city: 'Cergy-Pontoise',  division: 'Magnus', coords: [2.0631, 49.0361] },
  { name: 'Rapaces de Gap',       city: 'Gap',             division: 'Magnus', coords: [6.0820, 44.5594] },
  { name: 'Pionniers de Chamonix',city: 'Chamonix',        division: 'Magnus', coords: [6.8694, 45.9237] },
  { name: 'Diables Rouges',       city: 'Briançon',        division: 'Magnus', coords: [6.6450, 44.8990] },
  { name: 'Aigles de Nice',       city: 'Nice',            division: 'Magnus', coords: [7.2620, 43.7102] },
  { name: 'Hormadi Anglet',       city: 'Anglet',          division: 'Magnus', coords: [-1.5158, 43.4810] },
  { name: 'Spartiates de Marseille', city: 'Marseille',    division: 'Magnus', coords: [5.3698, 43.2965] },
  // D1
  { name: 'Corsaires de Dunkerque', city: 'Dunkerque',     division: 'D1', coords: [2.3770, 51.0344] },
  { name: 'Scorpions de Mulhouse',  city: 'Mulhouse',      division: 'D1', coords: [7.3389, 47.7508] },
  { name: 'Corsaires de Nantes',    city: 'Nantes',        division: 'D1', coords: [-1.5536, 47.2184] },
  { name: 'Drakkars de Caen',       city: 'Caen',          division: 'D1', coords: [-0.3708, 49.1829] },
  { name: 'Sangliers Arvernes',     city: 'Clermont-Fd',   division: 'D1', coords: [3.0870, 45.7772] },
  { name: 'Remparts de Tours',      city: 'Tours',         division: 'D1', coords: [0.6848, 47.3941] },
  { name: 'Dogs de Cholet',         city: 'Cholet',        division: 'D1', coords: [-0.8790, 47.0594] },
  { name: 'Ducs de Dijon',          city: 'Dijon',         division: 'D1', coords: [5.0415, 47.3220] },
  { name: 'Vipers de Montpellier',  city: 'Montpellier',   division: 'D1', coords: [3.8767, 43.6108] },
  { name: 'Étoile Noire',           city: 'Strasbourg',    division: 'D1', coords: [7.7521, 48.5734] },
  { name: 'Phénix de Reims',        city: 'Reims',         division: 'D1', coords: [4.0317, 49.2583] },
  { name: 'Chevaliers du Lac',      city: 'Annecy',        division: 'D1', coords: [6.1294, 45.8992] },
  { name: 'Albatros de Brest',      city: 'Brest',         division: 'D1', coords: [-4.4860, 48.3904] },
  { name: 'Bisons de Neuilly/Marne',city: 'Neuilly-s/-Marne', division: 'D1', coords: [2.5333, 48.8533] },
  // D2
  { name: 'Dauphins d’Épinal',      city: 'Épinal',        division: 'D2', coords: [6.4496, 48.1736] },
  { name: 'Ours de Villard',        city: 'Villard-de-Lans', division: 'D2', coords: [5.5550, 45.0707] },
  { name: 'Pingouins de Morzine',   city: 'Morzine',       division: 'D2', coords: [6.7090, 46.1790] },
  { name: 'Bélougas de Toulouse',   city: 'Toulouse',      division: 'D2', coords: [1.4442, 43.6047] },
  { name: 'Lyon Hockey Club',       city: 'Lyon',          division: 'D2', coords: [4.8357, 45.7640] },
  { name: 'Roanne (Renards)',       city: 'Roanne',        division: 'D2', coords: [4.0680, 46.0340] },
  { name: 'La Roche-sur-Yon',       city: 'La Roche/Yon',  division: 'D2', coords: [-1.4260, 46.6705] },
  { name: 'Titans de Colmar',       city: 'Colmar',        division: 'D2', coords: [7.3585, 48.0794] },
  // D3
  { name: 'Avignon',                city: 'Avignon',       division: 'D3', coords: [4.8055, 43.9493] },
  { name: 'Valence',                city: 'Valence',       division: 'D3', coords: [4.8920, 44.9334] },
  { name: 'Limoges',                city: 'Limoges',       division: 'D3', coords: [1.2611, 45.8336] },
  { name: 'Besançon',               city: 'Besançon',      division: 'D3', coords: [6.0240, 47.2378] },
  { name: 'Belfort',                city: 'Belfort',       division: 'D3', coords: [6.8638, 47.6379] },
  { name: 'Courbevoie',             city: 'Courbevoie',    division: 'D3', coords: [2.2561, 48.8970] },
  { name: 'Wasquehal',              city: 'Wasquehal',     division: 'D3', coords: [3.1300, 50.6700] },
]

const DIV_META: Record<Division, { label: string; color: string }> = {
  Magnus: { label: 'Ligue Magnus', color: '#4a7fff' },
  D1:     { label: 'Division 1',   color: '#c084fc' },
  D2:     { label: 'Division 2',   color: '#fb923c' },
  D3:     { label: 'Division 3',   color: '#34d399' },
}

const W = 600, H = 580

export default function FranceClubsMap() {
  const [geo, setGeo] = useState<{ features: unknown[] } | null>(null)
  const [active, setActive] = useState<Club | null>(null)

  useEffect(() => {
    fetch('/geo/france-regions.json').then(r => r.json()).then(setGeo).catch(() => {})
  }, [])

  if (!geo) {
    return <div className="w-full rounded-2xl animate-pulse" style={{ height: 420, background: 'var(--navy-mid)' }} />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projection = geoMercator().fitSize([W, H], geo as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const path = geoPath(projection as any)

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      {/* Carte */}
      <div className="relative w-full max-w-[380px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Carte des clubs de hockey en France">
          {/* Régions */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(geo.features as any[]).map((f, i) => (
            <path key={i} d={path(f) || ''} fill="rgba(74,127,255,0.04)" stroke="rgba(255,255,255,0.10)" strokeWidth={0.6} />
          ))}

          {/* Clubs */}
          {CLUBS.map(c => {
            const p = projection(c.coords)
            if (!p) return null
            const [x, y] = p
            const col = DIV_META[c.division].color
            const isActive = active?.name === c.name
            return (
              <g key={c.name} transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActive(c)} onClick={() => setActive(c)}>
                {isActive && <circle r={11} fill={col} opacity={0.25} />}
                <circle r={isActive ? 5.5 : 3.5} fill={col} stroke="#0a0f1e" strokeWidth={1.2} />
              </g>
            )
          })}

          {/* Étiquette du club survolé */}
          {active && (() => {
            const p = projection(active.coords)
            if (!p) return null
            const [x, y] = p
            const w = active.name.length * 6.6 + 18
            return (
              <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
                <rect x={-w / 2} y={-32} width={w} height={21} rx={5} fill="#0a0f1e" stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} />
                <text x={0} y={-17.5} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">{active.name}</text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Panneau latéral : légende + club actif */}
      <div className="md:w-56 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gray)' }}>
            {CLUBS.length} clubs · survole la carte
          </p>
          <div className="space-y-2">
            {(Object.keys(DIV_META) as Division[]).map(d => (
              <div key={d} className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DIV_META[d].color }} />
                <span className="text-sm" style={{ color: 'var(--white)' }}>{DIV_META[d].label}</span>
                <span className="text-xs ml-auto" style={{ color: 'var(--gray)' }}>
                  {CLUBS.filter(c => c.division === d).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Club actif */}
        <div className="p-4 rounded-xl min-h-[88px] flex flex-col justify-center"
          style={{ background: 'var(--navy-card)', border: '1px solid var(--border)' }}>
          {active ? (
            <>
              <p className="font-semibold text-sm" style={{ color: 'var(--white)' }}>{active.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>📍 {active.city}</p>
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full self-start"
                style={{ background: `${DIV_META[active.division].color}20`, color: DIV_META[active.division].color }}>
                {DIV_META[active.division].label}
              </span>
            </>
          ) : (
            <p className="text-xs" style={{ color: 'var(--gray)' }}>Survole un point pour voir le club et sa division.</p>
          )}
        </div>
      </div>
    </div>
  )
}
