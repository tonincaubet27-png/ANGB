// Rubriques de l'espace « Savoirs » (les actualités ont leur propre page).
export const RUBRIQUE_ACTUS = 'Actualités'

export const RUBRIQUES: { nom: string; emoji: string; desc: string }[] = [
  { nom: 'Le poste',       emoji: '🥅', desc: 'Comprendre le rôle du gardien de but' },
  { nom: 'Équipement',     emoji: '🛡️', desc: 'Choisir, régler et entretenir son matériel' },
  { nom: 'Se développer',  emoji: '🌱', desc: 'Progresser saison après saison' },
  { nom: 'Technique',      emoji: '🎯', desc: 'Les gestes et les déplacements' },
  { nom: 'Tactique',       emoji: '🧠', desc: 'Lire le jeu et se placer' },
  { nom: 'Physique',       emoji: '💪', desc: 'Préparation physique du gardien' },
  { nom: 'Santé',          emoji: '🩺', desc: 'Prévention, blessures, récupération' },
]

export const FORMATS: Record<string, { label: string; emoji: string; cta: string; color: string }> = {
  article:   { label: 'Article',   emoji: '📖', cta: 'Lire',                color: '#4a7fff' },
  video:     { label: 'Vidéo',     emoji: '▶️', cta: 'Regarder la vidéo',   color: '#ED2939' },
  interview: { label: 'Interview', emoji: '🎙️', cta: "Lire l'interview",    color: '#4a7fff' },
  podcast:   { label: 'Podcast',   emoji: '🎧', cta: 'Écouter le podcast',  color: '#a78bfa' },
  reportage: { label: 'Reportage', emoji: '📸', cta: 'Voir le reportage',   color: '#34d399' },
}
