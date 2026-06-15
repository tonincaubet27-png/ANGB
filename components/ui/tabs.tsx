'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export type Tab = {
  title: string
  value: string
  content?: React.ReactNode
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function Tabs({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Tab[]
  containerClassName?: string
  activeTabClassName?: string
  tabClassName?: string
  contentClassName?: string
}) {
  const [active, setActive] = useState<Tab>(propTabs[0])
  const [tabs, setTabs]     = useState<Tab[]>(propTabs)
  const [hovering, setHovering] = useState(false)

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs]
    const [selected] = newTabs.splice(idx, 1)
    newTabs.unshift(selected)
    setTabs(newTabs)
    setActive(newTabs[0])
  }

  return (
    <>
      {/* ── Tab headers ──────────────────────────────────────────────────── */}
      <div
        className={`flex flex-row items-center justify-start relative overflow-auto no-visible-scrollbar max-w-full w-full ${containerClassName ?? ''}`}
        style={{ perspective: '1000px' }}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.value}
            onClick={() => moveSelectedTabToTop(idx)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={`relative px-4 py-2 rounded-full whitespace-nowrap transition-transform duration-200 hover:scale-110 ${tabClassName ?? ''}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Indicateur actif animé */}
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                className={`absolute inset-0 rounded-full ${activeTabClassName ?? ''}`}
                style={{
                  background: 'rgba(74,127,255,0.18)',
                  border: '1px solid rgba(74,127,255,0.3)',
                }}
              />
            )}
            <span
              className="relative block"
              style={{
                color: active.value === tab.value ? 'var(--white)' : 'var(--gray)',
                transition: 'color 0.2s',
              }}
            >
              {tab.title}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <FadeInDiv
        tabs={tabs}
        active={active}
        hovering={hovering}
        className={contentClassName}
      />
    </>
  )
}

// ── FadeInDiv ─────────────────────────────────────────────────────────────────
function FadeInDiv({
  tabs,
  hovering,
  className,
}: {
  tabs: Tab[]
  active: Tab
  hovering?: boolean
  className?: string
}) {
  const isActive = (tab: Tab) => tab.value === tabs[0].value

  return (
    <div className="relative w-full h-full">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          style={{
            scale:   1 - idx * 0.1,
            top:     hovering ? idx * -50 : 0,
            zIndex:  -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{ y: isActive(tab) ? [0, 40, 0] : 0 }}
          className={`w-full h-full absolute top-0 left-0 ${className ?? ''}`}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  )
}
