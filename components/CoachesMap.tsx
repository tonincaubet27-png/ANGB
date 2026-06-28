'use client'

import { useEffect, useMemo, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'

export interface Coach {
  id: string
  name: string
  club?: string
  region?: string
  division?: string
  photo_url?: string
}

const W = 600, H = 580

export const REGIONS_FR = [
  'Île-de-France', 'Centre-Val de Loire', 'Bourgogne-Franche-Comté', 'Normandie',
  'Hauts-de-France', 'Grand Est', 'Pays de la Loire', 'Bretagne', 'Nouvelle-Aquitaine',
  'Occitanie', 'Auvergne-Rhône-Alpes', "Provence-Alpes-Côte d'Azur", 'Corse',
]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
const KNOWN: Record<string, string> = Object.fromEntries(REGIONS_FR.map(n => [norm(n), n]))
const ALIAS: Record<string, string> = {
  paca: "Provence-Alpes-Côte d'Azur",
  rhonealpes: 'Auvergne-Rhône-Alpes',
  auvergne: 'Auvergne-Rhône-Alpes',
  centre: 'Centre-Val de Loire',
  bourgogne: 'Bourgogne-Franche-Comté',
  franchecomte: 'Bourgogne-Franche-Comté',
}

/** Texte libre d'une fiche → nom officiel de région, ou null. */
export function coachRegion(raw?: string): string | null {
  if (!raw) return null
  const n = norm(raw)
  return ALIAS[n] ?? KNOWN[n] ?? null
}

export default function CoachesMap({ coaches, activeRegion, onRegion }: {
  coaches: Coach[]
  activeRegion: string | null
  onRegion: (r: string | null) => void
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geo, setGeo] = useState<{ features: any[] } | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    fetch('/geo/france-regions.json').then(r => r.json()).then(setGeo).catch(() => {})
  }, [])

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    coaches.forEach(c => { const nom = coachRegion(c.region); if (nom) m[nom] = (m[nom] ?? 0) + 1 })
    return m
  }, [coaches])

  if (!geo) {
    return <div className="w-full rounded-2xl animate-pulse" style={{ height: 420, background: 'var(--navy-mid)' }} />
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projection = geoMercator().fitSize([W, H], geo as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const path = geoPath(projection as any)
  const maxCount = Math.max(1, ...Object.values(counts))
  const labelNom = hover ?? activeRegion

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Carte des entraîneurs gardiens en France">
      {/* Régions */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(geo.features as any[]).map((f, i) => {
        const nom = f.properties.nom as string
        const c = counts[nom] ?? 0
        const isActive = activeRegion === nom
        const isHover = hover === nom
        const base = c > 0 ? 0.14 + 0.46 * (c / maxCount) : 0.04
        const fill = isActive ? 'rgba(74,127,255,0.6)' : `rgba(74,127,255,${isHover ? base + 0.16 : base})`
        return (
          <path key={i} d={path(f) || ''} fill={fill}
            stroke={isActive ? '#4a7fff' : 'rgba(255,255,255,0.12)'} strokeWidth={isActive ? 1.6 : 0.6}
            style={{ cursor: c > 0 ? 'pointer' : 'default', transition: 'fill 0.25s, stroke 0.25s' }}
            onMouseEnter={() => setHover(nom)} onMouseLeave={() => setHover(null)}
            onClick={() => { if (c > 0) onRegion(isActive ? null : nom) }}>
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin={`${i * 0.05}s`} fill="freeze" />
          </path>
        )
      })}

      {/* Marqueurs animés par zone */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(geo.features as any[]).map((f, i) => {
        const nom = f.properties.nom as string
        const c = counts[nom] ?? 0
        if (!c) return null
        const [x, y] = path.centroid(f)
        const r = 9 + Math.min(11, c * 2.5)
        const isActive = activeRegion === nom
        return (
          <g key={'m' + i} transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHover(nom)} onMouseLeave={() => setHover(null)}
            onClick={() => onRegion(isActive ? null : nom)}>
            <circle r={r} fill="#4a7fff" opacity={0.22}>
              <animate attributeName="r" values={`${r};${r + 7};${r}`} dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.22;0.04;0.22" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle r={r * 0.72} fill={isActive ? '#6f9bff' : '#4a7fff'} stroke="#0a0f1e" strokeWidth={1.6} />
            <text y={4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff" style={{ pointerEvents: 'none' }}>{c}</text>
          </g>
        )
      })}

      {/* Étiquette région survolée / active */}
      {(() => {
        if (!labelNom) return null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const f = (geo.features as any[]).find(x => x.properties.nom === labelNom)
        if (!f) return null
        const [x, y] = path.centroid(f)
        const c = counts[labelNom] ?? 0
        const label = `${labelNom} · ${c} entraîneur${c > 1 ? 's' : ''}`
        const w = label.length * 6.4 + 18
        return (
          <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'none' }}>
            <rect x={-w / 2} y={-50} width={w} height={22} rx={6} fill="#0a0f1e" stroke="rgba(255,255,255,0.2)" strokeWidth={0.8} />
            <text x={0} y={-35} textAnchor="middle" fontSize={11} fontWeight={600} fill="#fff">{label}</text>
          </g>
        )
      })()}
    </svg>
  )
}
