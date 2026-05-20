import { useTranslation } from 'react-i18next'
import { callEdgeFunction } from '../../lib/supabase'
import { useToast } from '../../hooks/useToast'
import Toast from '../../components/ui/Toast'
import KanbanBoard from '../../components/ui/KanbanBoard'
import type { OrderStatus } from '../../lib/types'

export default function OrdersManager() {
  const { t } = useTranslation()
  const { toast, showToast } = useToast()

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await callEdgeFunction('update-order-status', { order_id: orderId, status: newStatus })
    } catch (err) {
      showToast('שגיאה בעדכון סטטוס', 'error')
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{t('adminHome.orders')}</h1>
      <KanbanBoard onStatusChange={handleStatusChange} />
    </>
  )
}
