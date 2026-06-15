'use client'

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import React, { useRef } from 'react'
import { cn } from '@/lib/utils'

export const CometCard = ({
  rotateDepth = 15,
  translateDepth = 12,
  className,
  children,
}: {
  rotateDepth?: number
  translateDepth?: number
  className?: string
  children: React.ReactNode
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 100, damping: 20 })
  const mouseY = useSpring(y, { stiffness: 100, damping: 20 })

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [`${rotateDepth}deg`, `-${rotateDepth}deg`])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [`-${rotateDepth}deg`, `${rotateDepth}deg`])
  const translateX = useTransform(mouseX, [-0.5, 0.5], [`-${translateDepth}px`, `${translateDepth}px`])
  const translateY = useTransform(mouseY, [-0.5, 0.5], [`${translateDepth}px`, `-${translateDepth}px`])

  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100])
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.7) 5%, rgba(255,255,255,0) 65%)`

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <div className={cn('relative', className)} style={{ perspective: '1000px' }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, translateX, translateY, transformStyle: 'preserve-3d' }}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
        className="relative rounded-2xl"
      >
        {children}
        <motion.div
          className="pointer-events-none absolute inset-0 z-50 rounded-2xl mix-blend-overlay"
          style={{ background: glareBg, opacity: 0.55 }}
        />
      </motion.div>
    </div>
  )
}
