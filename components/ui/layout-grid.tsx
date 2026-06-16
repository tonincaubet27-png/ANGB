'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type LayoutCard = {
  id: number
  thumbnail: string
  className?: string
  badge?: React.ReactNode
  title?: React.ReactNode
  content: React.ReactNode
}

export const LayoutGrid = ({ cards }: { cards: LayoutCard[] }) => {
  const [selected, setSelected] = useState<LayoutCard | null>(null)
  const [last, setLast] = useState<LayoutCard | null>(null)

  const handleClick = (card: LayoutCard) => { setLast(selected); setSelected(card) }
  const handleOutside = () => { setLast(selected); setSelected(null) }

  return (
    <div
      className="w-full grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-4 relative"
      style={{ gridAutoRows: '17rem' }}
    >
      {cards.map(card => {
        const isSelected = selected?.id === card.id
        return (
          <div key={card.id} className={card.className}>
            <motion.div
              onClick={() => handleClick(card)}
              layoutId={`card-${card.id}`}
              className={cn(
                'overflow-hidden cursor-pointer shadow-lg',
                isSelected
                  ? 'fixed inset-0 z-50 m-auto h-[70vh] w-[92%] max-w-2xl rounded-2xl'
                  : (last?.id === card.id ? 'z-30 ' : '') + 'relative h-full w-full rounded-2xl',
              )}
            >
              <motion.img
                layoutId={`image-${card.id}`}
                src={card.thumbnail}
                alt=""
                className="object-cover absolute inset-0 h-full w-full"
                style={{ filter: 'grayscale(15%)' }}
              />
              {isSelected ? (
                <SelectedContent card={card} />
              ) : (
                <>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
                  {card.badge && <div className="absolute top-3 left-3 z-10">{card.badge}</div>}
                  {card.title && <div className="absolute bottom-3 left-4 right-4 z-10">{card.title}</div>}
                </>
              )}
            </motion.div>
          </div>
        )
      })}

      <motion.div
        onClick={handleOutside}
        className={cn('fixed inset-0 bg-black z-40', selected ? 'pointer-events-auto' : 'pointer-events-none')}
        animate={{ opacity: selected ? 0.7 : 0 }}
      />
    </div>
  )
}

function SelectedContent({ card }: { card: LayoutCard }) {
  return (
    <div className="relative h-full w-full flex flex-col justify-end z-[60]">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.25) 100%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="relative p-6 md:p-8 z-[70]"
      >
        {card.content}
      </motion.div>
    </div>
  )
}
