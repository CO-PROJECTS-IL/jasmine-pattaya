export const ORDER_STATUSES = ['new', 'preparing', 'served', 'paid'] as const

export const ORDER_STATUS_COLORS: Record<string, string> = {
  new: '#ef4444',
  preparing: '#f97316',
  served: '#eab308',
  paid: '#22c55e',
}

export const ORDER_STATUS_LABELS: Record<string, { he: string; en: string; th: string }> = {
  new: { he: 'חדשה', en: 'New', th: 'ใหม่' },
  preparing: { he: 'בהכנה', en: 'Preparing', th: 'กำลังเตรียม' },
  served: { he: 'הוגשה', en: 'Served', th: 'เสิร์ฟแล้ว' },
  paid: { he: 'שולמה', en: 'Paid', th: 'ชำระแล้ว' },
}

export const SHIFT_TYPES = ['morning', 'evening', 'full', 'custom', 'off'] as const

export const EMPLOYEE_ROLES = ['cook', 'waiter', 'bartender', 'other'] as const

export const EXPENSE_CATEGORIES = ['equipment', 'repair', 'supplies', 'other'] as const

export const DEFAULT_ADMIN_PIN = '1111'
export const DEFAULT_EMPLOYEE_PIN = '0000'
export const DEFAULT_RADIUS_METERS = 50
export const THAILAND_TIMEZONE = 'Asia/Bangkok'
