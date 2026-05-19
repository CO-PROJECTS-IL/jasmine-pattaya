import { useTranslation } from 'react-i18next'
import { callEdgeFunction } from '../../lib/supabase'
import KanbanBoard from '../../components/ui/KanbanBoard'
import type { OrderStatus } from '../../lib/types'

export default function KitchenBoard() {
  const { t } = useTranslation()

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await callEdgeFunction('update-order-status', { orderId, status: newStatus })
    } catch {}
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--dark)' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--gold)' }}>{t('kitchen.title')}</h1>
        <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'oklch(0.25 0.008 60)', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('he-IL')}
        </span>
      </div>
      <KanbanBoard onStatusChange={handleStatusChange} />
    </div>
  )
}
