'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Vrai sur ordinateur (souris précise) quand l'utilisateur n'a pas demandé à réduire les animations.
 * Sur téléphone et tablette tactile : faux → animations sobres.
 */
export function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    const update = () => setFine(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return fine
}

/** Bouton « magnétique » : il suit légèrement le curseur (ordinateur seulement). */
export function Magnetic({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const fine = useFinePointer()
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })

  const onMove = (e: React.MouseEvent) => {
    if (!fine || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => { x.set(0); y.set(0) }

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ x, y }} className={className ?? 'inline-block'}>
      {children}
    </motion.div>
  )
}

/** Bandeau de photos qui défile en continu (pause au survol, coupé si animations réduites). */
export function PhotoMarquee({ photos, speed = 45 }: { photos: { src: string; alt: string }[]; speed?: number }) {
  const list = [...photos, ...photos]
  return (
    <div className="marquee relative overflow-hidden py-5" style={{ maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)' }}>
      <div className="marquee-track flex gap-4 w-max" style={{ animationDuration: `${speed}s` }}>
        {list.map((p, i) => (
          <div key={i} className="marquee-item relative h-28 md:h-40 w-44 md:w-64 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ border: '1px solid var(--border)' }} aria-hidden={i >= photos.length}>
            <Image src={p.src} alt={i >= photos.length ? '' : p.alt} fill sizes="256px" className="object-cover transition-transform duration-500" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,14,28,0.55), transparent 60%)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
