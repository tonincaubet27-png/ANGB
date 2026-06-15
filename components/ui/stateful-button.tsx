'use client'

import React from 'react'
import { motion, useAnimate } from 'framer-motion'
import { cn } from '@/lib/utils'

export const Button = ({
  className,
  children,
  onClick,
  disabled,
}: {
  className?: string
  children: React.ReactNode
  onClick?: () => Promise<void> | void
  disabled?: boolean
}) => {
  const [scope, animate] = useAnimate()

  const animateLoading = async () => {
    await animate('.loader', { width: '20px', scale: 1, display: 'block' }, { duration: 0.2 })
  }
  const animateSuccess = async () => {
    await animate('.loader', { width: '0px', scale: 0, display: 'none' }, { duration: 0.2 })
    await animate('.check', { width: '20px', scale: 1, display: 'block' }, { duration: 0.2 })
    await animate('.check', { width: '0px', scale: 0, display: 'none' }, { delay: 2, duration: 0.2 })
  }

  const handleClick = async () => {
    if (disabled) return
    await animateLoading()
    try {
      await onClick?.()
    } finally {
      await animateSuccess()
    }
  }

  return (
    <motion.button
      layout
      ref={scope}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50',
        className,
      )}
      style={{ background: 'var(--accent)' }}
    >
      <svg className="loader animate-spin" style={{ display: 'none', width: 0, transform: 'scale(0)' }}
        viewBox="0 0 24 24" fill="none" height="20">
        <path d="M12 3a9 9 0 1 0 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <svg className="check" style={{ display: 'none', width: 0, transform: 'scale(0)' }}
        viewBox="0 0 24 24" fill="none" height="20">
        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <motion.span layout>{children}</motion.span>
    </motion.button>
  )
}
