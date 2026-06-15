'use client'

import React from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export interface ParallaxItem {
  title: string
  link: string
  thumbnail: string
}

export function HeroParallax({
  items,
  title,
  description,
}: {
  items: ParallaxItem[]
  title: string
  description?: string
}) {
  const half = Math.ceil(items.length / 2)
  const firstRow = items.slice(0, half)
  const secondRow = items.slice(half)

  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const springConfig = { stiffness: 300, damping: 30, bounce: 100 }

  const translateX = useSpring(useTransform(scrollYProgress, [0, 1], [0, 700]), springConfig)
  const translateXReverse = useSpring(useTransform(scrollYProgress, [0, 1], [0, -700]), springConfig)
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [12, 0]), springConfig)
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.3, 1]), springConfig)
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [12, 0]), springConfig)
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.3], [-400, 150]), springConfig)

  return (
    <div
      ref={ref}
      className="h-[210vh] py-24 overflow-hidden antialiased relative flex flex-col self-auto"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      <div className="max-w-7xl relative mx-auto px-4 md:px-8 w-full">
        <span className="overline-fr mb-3 inline-block">Nos actions</span>
        <h2 className="text-4xl md:text-6xl mt-2" style={{ fontFamily: 'var(--font-bebas)', color: 'var(--white)', letterSpacing: '0.04em', lineHeight: 1 }}>
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-sm md:text-base max-w-xl leading-relaxed" style={{ color: 'var(--gray)' }}>
            {description}
          </p>
        )}
      </div>

      <motion.div style={{ rotateX, rotateZ, translateY, opacity }} className="mt-10">
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-6 md:space-x-10 mb-6 md:mb-10 px-4">
          {firstRow.map(item => <Tile key={item.title} item={item} translate={translateX} />)}
        </motion.div>
        <motion.div className="flex flex-row space-x-6 md:space-x-10 px-4">
          {secondRow.map(item => <Tile key={item.title} item={item} translate={translateXReverse} />)}
        </motion.div>
      </motion.div>
    </div>
  )
}

function Tile({ item, translate }: { item: ParallaxItem; translate: MotionValue<number> }) {
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -16 }}
      className="group relative h-60 w-[18rem] md:h-80 md:w-[26rem] flex-shrink-0 rounded-2xl overflow-hidden"
    >
      <Link href={item.link} className="block h-full w-full">
        <Image src={item.thumbnail} alt={item.title} fill sizes="26rem" className="object-cover" style={{ filter: 'grayscale(35%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
        <div className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100" style={{ background: 'rgba(74,127,255,0.18)' }} />
        <div className="absolute top-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1" style={{ background: '#002395' }} />
          <div className="flex-1" style={{ background: '#fff' }} />
          <div className="flex-1" style={{ background: '#ED2939' }} />
        </div>
        <h3 className="absolute bottom-4 left-5 right-5 text-xl md:text-2xl" style={{ fontFamily: 'var(--font-bebas)', color: '#fff', letterSpacing: '0.04em' }}>
          {item.title}
        </h3>
      </Link>
    </motion.div>
  )
}
