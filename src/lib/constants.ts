export const ORDER_STATUSES = ['new', 'preparing', 'ready', 'served', 'paid'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const CATEGORY_SLUGS = [
  'main',
  'kids',
  'salad-set',
  'salads-ask',
  'happy-friday',
  'breakfast',
  'lunch',
  'hummus',
  'yemeni',
  'lafa',
  'salad',
  'baguettes',
  'extras',
  'drinks',
  'shakes',
] as const
export type CategorySlug = (typeof CATEGORY_SLUGS)[number]

export const TABLE_MIN = 1
export const TABLE_MAX = 30

export interface Category {
  id: string
  slug: CategorySlug
  nameHe: string
  nameEn: string
  nameTh: string
  sortOrder: number
}

export interface Dish {
  id: string
  categoryId: string
  nameHe: string
  nameEn: string
  nameTh: string
  descriptionHe: string
  descriptionEn: string
  descriptionTh: string
  price: number
  imageUrl: string | null
  available: boolean
  kosher: boolean
  spicy: boolean
  vegetarian: boolean
  sortOrder: number
}

export interface OrderItem {
  id: string
  orderId: string
  dishId: string
  nameHe: string
  nameEn: string
  nameTh: string
  price: number
  quantity: number
  notes: string
}

export interface Order {
  id: string
  tableNumber: number
  status: OrderStatus
  totalAmount: number
  discountPercent: number
  notes: string
  memberPhone: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface Member {
  id: string
  name: string
  phone: string
  email: string | null
  joinedAt: string
  totalSpent: number
  visitCount: number
}

export interface Event {
  id: string
  titleHe: string
  titleEn: string
  titleTh: string
  descriptionHe: string
  descriptionEn: string
  descriptionTh: string
  date: string
  time: string
  pricePerPerson: number
  maxGuests: number
  imageUrl: string | null
  active: boolean
}

export interface Settings {
  id: string
  openingHours: string
  closedDates: string[]
  adminPin: string
  kitchenPin: string
  clubDiscountPercent: number
}
