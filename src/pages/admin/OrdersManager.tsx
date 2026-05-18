import { useTranslation } from 'react-i18next'
import { callEdgeFunction } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'
import KanbanBoard from '../../components/ui/KanbanBoard'
import type { OrderStatus } from '../../lib/types'

export default function OrdersManager() {
  const { t } = useTranslation()

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await callEdgeFunction('update-order-status', { orderId, status: newStatus })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-xl text-[#c9a84c] mb-6">{t('adminHome.orders')}</h1>
      <KanbanBoard onStatusChange={handleStatusChange} />
    </AdminLayout>
  )
}
