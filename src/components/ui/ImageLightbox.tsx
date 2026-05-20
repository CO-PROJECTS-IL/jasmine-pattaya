import { useState, useEffect } from 'react'
import { enhanceDishImage } from '../../lib/image-utils'

interface ImageLightboxProps {
  src: string | null
  alt: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 250)
  }

  useEffect(() => {
    if (!src) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [src])

  if (!src) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleClose}>
      <div
        className={`absolute inset-0 ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop'}`}
        style={{ backgroundColor: 'oklch(0.03 0.008 255 / 0.92)', backdropFilter: 'blur(8px)' }}
      />
      <button
        onClick={handleClose}
        className="absolute top-4 end-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{
          backgroundColor: 'oklch(0.15 0.008 255 / 0.8)',
          color: 'oklch(0.80 0.012 255)',
        }}
      >
        &times;
      </button>
      <img
        src={enhanceDishImage(src, 1200)}
        alt={alt}
        className={`relative z-10 max-w-[92vw] max-h-[85vh] rounded-2xl object-contain ${isClosing ? 'animate-lightbox-out' : 'animate-scale-in'}`}
        style={{ boxShadow: '0 20px 60px oklch(0 0 0 / 0.6)' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}
