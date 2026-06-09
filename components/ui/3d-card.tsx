'use client'

import React, { createContext, useContext, useRef, useState } from 'react'

type MouseEnterCtx = [boolean, React.Dispatch<React.SetStateAction<boolean>>]
const MouseEnterContext = createContext<MouseEnterCtx | undefined>(undefined)

// ── CardContainer ─────────────────────────────────────────────────────────────
export function CardContainer({
  children, className, containerClassName,
}: {
  children: React.ReactNode
  className?: string
  containerClassName?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMouseEntered, setIsMouseEntered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - left - width  / 2) / 22
    const y = (e.clientY - top  - height / 2) / 22
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`
  }

  const handleMouseLeave = () => {
    setIsMouseEntered(false)
    if (containerRef.current)
      containerRef.current.style.transform = 'rotateY(0deg) rotateX(0deg)'
  }

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={containerClassName}
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsMouseEntered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={containerRef}
          className={className}
          style={{ transition: 'all 0.12s linear', transformStyle: 'preserve-3d' }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  )
}

// ── CardBody ──────────────────────────────────────────────────────────────────
export function CardBody({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={{ transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  )
}

// ── CardItem ──────────────────────────────────────────────────────────────────
export function CardItem({
  children, className,
  translateX = 0, translateY = 0, translateZ = 0,
  rotateX = 0, rotateY = 0, rotateZ = 0,
  as: Tag = 'div',
  ...rest
}: {
  children: React.ReactNode
  className?: string
  translateX?: number
  translateY?: number
  translateZ?: number
  rotateX?: number
  rotateY?: number
  rotateZ?: number
  as?: React.ElementType
  [key: string]: unknown
}) {
  const ref = useRef<HTMLElement>(null)
  const [isMouseEntered] = useContext(MouseEnterContext) ?? [false]

  React.useEffect(() => {
    if (!ref.current) return
    ref.current.style.transform = isMouseEntered
      ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
      : 'translateX(0) translateY(0) translateZ(0) rotateX(0) rotateY(0) rotateZ(0)'
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ])

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ transition: 'all 0.35s ease-out', transformStyle: 'preserve-3d' }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
