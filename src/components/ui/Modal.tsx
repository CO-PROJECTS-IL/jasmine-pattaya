import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#121212] border border-[#c9a84c]/30 rounded-xl p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-[#c9a84c]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
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
