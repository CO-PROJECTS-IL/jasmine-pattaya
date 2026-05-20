import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    if (!dialog) return
    const focusable = dialog.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ backgroundColor: 'oklch(0.05 0.008 255 / 0.4)' }} onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-xl p-6 z-10"
        style={{
          backgroundColor: 'oklch(0.98 0.005 255)',
          border: '1px solid oklch(0.88 0.02 255)',
          color: 'oklch(0.25 0.02 255)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ color: 'var(--accent)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-2xl rounded-xl transition-colors"
            style={{ color: 'oklch(0.45 0.02 255)' }}
            aria-label={t('common.close')}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
