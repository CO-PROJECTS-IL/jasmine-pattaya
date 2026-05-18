import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Order } from '../../lib/constants'

const MOCK_HISTORY: Order[] = [
  {
    id: 'hist-1', tableNumber: 5, status: 'paid', totalAmount: 740, discountPercent: 10,
    notes: '', memberPhone: '0501234567',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    items: [
      { id: 'h1', orderId: 'hist-1', dishId: 'd1', nameHe: 'שניצל הבית', nameEn: 'House Schnitzel', nameTh: 'ชนิทเซลบ้าน', price: 370, quantity: 2, notes: '' },
    ],
  },
  {
    id: 'hist-2', tableNumber: 5, status: 'paid', totalAmount: 560, discountPercent: 10,
    notes: '', memberPhone: '0501234567',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    items: [
      { id: 'h2', orderId: 'hist-2', dishId: 'd2', nameHe: 'שאוורמה עוף', nameEn: 'Chicken Shawarma', nameTh: 'ชาวาร์มาไก่', price: 380, quantity: 1, notes: '' },
      { id: 'h3', orderId: 'hist-2', dishId: 'd3', nameHe: 'חומוס טחינה', nameEn: 'Hummus Tahini', nameTh: 'ฮัมมัสทาฮินี', price: 180, quantity: 1, notes: '' },
    ],
  },
]

export default function OrderHistory() {
  const { t, i18n } = useTranslation()
  const [phone, setPhone] = useState('')
  const [searched, setSearched] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  const handleSearch = () => {
    if (!phone.trim()) return
    setOrders(MOCK_HISTORY)
    setSearched(true)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getItemName = (item: { nameHe: string; nameEn: string; nameTh: string }) =>
    i18n.language === 'he' ? item.nameHe : i18n.language === 'th' ? item.nameTh : item.nameEn

  const statusColors: Record<string, string> = {
    new: 'text-red-400',
    preparing: 'text-amber-400',
    ready: 'text-green-400',
    served: 'text-blue-400',
    paid: 'text-gray-400',
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl text-[#c9a84c] font-bold mb-6">{t('history.title')}</h1>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 mb-6">
        <p className="text-gray-400 text-sm mb-3">{t('history.enterPhone')}</p>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('history.phonePlaceholder')}
            dir="ltr"
            className="flex-1 bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c]"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-[#c9a84c] text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors"
          >
            {t('common.search')}
          </button>
        </div>
      </div>

      {searched && orders.length === 0 && (
        <div className="text-center text-gray-500 py-12">{t('history.noOrders')}</div>
      )}

      {orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium">{formatDate(order.createdAt)}</span>
                  <span className={`text-xs font-medium ${statusColors[order.status]}`}>
                    {t(`status.${order.status}`)}
                  </span>
                </div>
                <span className="text-[#c9a84c] font-bold">฿{order.totalAmount}</span>
              </div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {item.quantity}x {getItemName(item)}
                    </span>
                    <span className="text-gray-500">฿{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              {order.discountPercent > 0 && (
                <div className="text-xs text-green-400 mt-2">
                  {t('cart.discount')}: {order.discountPercent}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
