'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export interface HoverItem {
  title: string
  description: string
  link: string
  icon?: string
  accent?: string // couleur d'accent
}

export function HoverEffect({ items, className }: { items: HoverItem[]; className?: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className ?? ''}`}>
      {items.map((item, idx) => (
        <Link
          href={item.link}
          key={item.title}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{ textDecoration: 'none' }}
        >
          {/* Fond animé au hover */}
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block rounded-2xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
                style={{ background: 'rgba(74,127,255,0.07)' }}
              />
            )}
          </AnimatePresence>

          {/* Carte */}
          <div
            className="relative z-20 rounded-2xl h-full p-6 flex flex-col gap-3"
            style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${item.accent ?? '#002395'}`,
              transition: 'border-color 0.2s',
            }}>

            {/* Icône */}
            {item.icon && (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'var(--navy-light)' }}>
                {item.icon}
              </div>
            )}

            {/* Titre */}
            <h3 style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '1.3rem',
              letterSpacing: '0.05em',
              color: 'var(--white)',
              lineHeight: 1.1,
            }}>
              {item.title}
            </h3>

            {/* Description */}
            <p style={{ fontSize: 13, color: 'var(--gray)', lineHeight: 1.65, flex: 1 }}>
              {item.description}
            </p>

            {/* CTA */}
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: item.accent ?? '#4a7fff',
              marginTop: 4,
            }}>
              En savoir plus →
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
