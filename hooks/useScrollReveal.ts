'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )

    // Petit délai : laisser React rendre le nouveau DOM après navigation
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
    }, 30)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname])
}
