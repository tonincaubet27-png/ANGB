'use client'

import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

/** Recadre l'image source (object URL) sur la zone choisie, en limitant la taille de sortie. */
async function getCroppedFile(src: string, area: Area, fileName: string, maxDim: number): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = src
  })
  const scale = Math.min(1, maxDim / Math.max(area.width, area.height))
  const w = Math.round(area.width * scale)
  const h = Math.round(area.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h)
  const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.9))
  return new File([blob], fileName.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
}

export default function ImageCropper({
  file, aspect, cropShape = 'rect', title, maxDim = 1600, onCancel, onCropped,
}: {
  file: File
  aspect: number
  cropShape?: 'rect' | 'round'
  title?: string
  maxDim?: number
  onCancel: () => void
  onCropped: (f: File) => void
}) {
  const [src] = useState(() => URL.createObjectURL(file))
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const onComplete = useCallback((_: Area, px: Area) => setArea(px), [])

  const close = (cb: () => void) => { URL.revokeObjectURL(src); cb() }

  const confirm = async () => {
    if (!area) return
    setBusy(true)
    const f = await getCroppedFile(src, area, file.name, maxDim)
    close(() => onCropped(f))
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: 'var(--navy-mid)', border: '1px solid var(--border-mid)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--white)' }}>{title || 'Cadrer l’image'}</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>Glisse pour déplacer · molette ou curseur pour zoomer</p>
        </div>
        <div className="relative" style={{ height: 340, background: '#000' }}>
          <Cropper
            image={src} crop={crop} zoom={zoom} aspect={aspect} cropShape={cropShape}
            showGrid={cropShape === 'rect'} restrictPosition
            onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete}
          />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--gray)' }}>Zoom</span>
            <input type="range" min={1} max={3} step={0.01} value={zoom}
              onChange={e => setZoom(Number(e.target.value))} className="flex-1" style={{ accentColor: 'var(--accent)' }} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => close(onCancel)} className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ color: 'var(--gray)', border: '1px solid var(--border)' }}>Annuler</button>
            <button onClick={confirm} disabled={busy}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--accent)' }}>
              {busy ? 'Traitement…' : '✓ Valider'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
