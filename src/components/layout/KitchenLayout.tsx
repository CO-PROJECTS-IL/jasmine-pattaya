import type { ReactNode } from 'react'
import OfflineBanner from '../ui/OfflineBanner'

interface KitchenLayoutProps {
  children: ReactNode
}

export default function KitchenLayout({ children }: KitchenLayoutProps) {
  return (
    <div className="min-h-screen bg-[#080808]">
      <OfflineBanner />
      <main>{children}</main>
    </div>
  )
}
