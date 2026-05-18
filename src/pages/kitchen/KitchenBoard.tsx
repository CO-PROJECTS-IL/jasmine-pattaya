import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import OrderCard from '../../components/ui/OrderCard'
import type { Order, OrderStatus } from '../../lib/constants'

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1',
    tableNumber: 3,
    status: 'new',
    totalAmount: 740,
    discountPercent: 0,
    notes: '',
    memberPhone: null,
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i1', orderId: 'ord-1', dishId: 'd1', nameHe: 'שניצל הבית', nameEn: 'House Schnitzel', nameTh: 'ชนิทเซลบ้าน', price: 370, quantity: 2, notes: '' },
    ],
  },
  {
    id: 'ord-2',
    tableNumber: 7,
    status: 'new',
    totalAmount: 650,
    discountPercent: 0,
    notes: 'בלי בצל',
    memberPhone: null,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i2', orderId: 'ord-2', dishId: 'd2', nameHe: 'שאוורמה עוף', nameEn: 'Chicken Shawarma', nameTh: 'ชาวาร์มาไก่', price: 380, quantity: 1, notes: '' },
      { id: 'i3', orderId: 'ord-2', dishId: 'd3', nameHe: 'חומוס טחינה', nameEn: 'Hummus Tahini', nameTh: 'ฮัมมัสทาฮินี', price: 180, quantity: 1, notes: '' },
    ],
  },
  {
    id: 'ord-3',
    tableNumber: 12,
    status: 'preparing',
    totalAmount: 400,
    discountPercent: 0,
    notes: '',
    memberPhone: null,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i4', orderId: 'ord-3', dishId: 'd4', nameHe: 'קבב הבית', nameEn: 'House Kebab', nameTh: 'เคบับบ้าน', price: 400, quantity: 1, notes: '' },
    ],
  },
  {
    id: 'ord-4',
    tableNumber: 5,
    status: 'ready',
    totalAmount: 440,
    discountPercent: 0,
    notes: '',
    memberPhone: null,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { id: 'i5', orderId: 'ord-4', dishId: 'd5', nameHe: 'בוקר ישראלית', nameEn: 'Israeli Breakfast', nameTh: 'อาหารเช้าอิสราเอล', price: 220, quantity: 2, notes: '' },
    ],
  },
]

export default function KitchenBoard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)

  const handleUpdateStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
      )
    )
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/kitchen')
  }

  const activeOrders = orders.filter((o) => o.status !== 'paid' && o.status !== 'served')
  const statusOrder: OrderStatus[] = ['new', 'preparing', 'ready']

  const sortedOrders = [...activeOrders].sort((a, b) => {
    const aIdx = statusOrder.indexOf(a.status)
    const bIdx = statusOrder.indexOf(b.status)
    if (aIdx !== bIdx) return aIdx - bIdx
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl text-[#c9a84c] font-bold">{t('kitchen.title')}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {activeOrders.length} {t('kitchen.items')}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded-lg bg-[#1a1a1a]"
          >
            {t('common.back')}
          </button>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500 text-xl">{t('kitchen.noOrders')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}
