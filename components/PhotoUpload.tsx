'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  currentUrl?: string | null
  name?: string
  onFileSelect: (file: File) => void
  size?: number  // diamètre en px, défaut 96
}

export default function PhotoUpload({ currentUrl, name, onFileSelect, size = 96 }: Props) {
  const fileRef                     = useRef<HTMLInputElement>(null)
  const [preview, setPreview]       = useState<string | null>(null)
  const [errSize, setErrSize]       = useState(false)

  const displayUrl = preview ?? currentUrl
  const initials   = name
    ? name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrSize(true); return
    }
    setErrSize(false)
    setPreview(URL.createObjectURL(file))
    onFileSelect(file)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => { setErrSize(false); fileRef.current?.click() }}
        className="relative rounded-full overflow-hidden group transition-transform hover:scale-105 focus:outline-none"
        style={{ width: size, height: size, border: '2px solid rgba(74,127,255,0.4)', flexShrink: 0 }}
        aria-label="Changer la photo"
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={name ?? 'Photo'}
            fill
            className="object-cover"
            unoptimized={displayUrl.startsWith('blob:')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold"
            style={{
              fontSize: size * 0.28,
              background: 'rgba(74,127,255,0.1)',
              color: '#4a7fff',
            }}>
            {initials}
          </div>
        )}
        {/* Overlay hover */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.65)' }}>
          <span style={{ fontSize: size * 0.22 }}>📷</span>
          <span className="text-white font-medium" style={{ fontSize: size * 0.12 }}>Changer</span>
        </div>
      </button>

      <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {displayUrl ? 'Cliquer pour changer' : 'Ajouter une photo (optionnel)'}
      </p>

      {errSize && (
        <p className="text-xs" style={{ color: '#f87171' }}>Photo trop grande — max 5 Mo</p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
