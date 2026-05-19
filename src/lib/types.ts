export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'paid'
export type PayType = 'hourly' | 'daily'
export type ShiftType = 'morning' | 'evening' | 'full' | 'custom' | 'off'
export type ExpenseFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'
export type UserRole = 'guest' | 'employee' | 'admin'

export interface Category {
  id: string
  name_he: string
  name_en: string
  name_th: string
  sort_order: number
}

export interface Dish {
  id: string
  category_id: string
  name_he: string
  name_en: string
  name_th: string
  description_he: string
  description_en: string
  description_th: string
  price: number
  image_url: string | null
  is_kosher: boolean
  is_spicy: boolean
  is_vegetarian: boolean
  is_available: boolean
  sort_order: number
}

export interface Order {
  id: string
  table_number: number
  status: OrderStatus
  total: number
  notes: string
  created_by: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  dish_id: string
  quantity: number
  price_at_order: number
  notes: string
  dish?: { name_he: string; name_en: string; name_th: string }
}

export interface Employee {
  id: string
  full_name: string
  phone: string
  role: string
  photo_url: string | null
  pay_type: PayType
  pay_rate: number
  start_date: string
  notes: string
  documents_url: string | null
  vacation_days: number
  is_active: boolean
  created_at: string
}

export interface Attendance {
  id: string
  employee_id: string
  check_in: string
  check_out: string | null
  is_manual: boolean
  manual_approved_at: string | null
  location_lat: number | null
  location_lng: number | null
}

export interface Shift {
  id: string
  employee_id: string
  date: string
  shift_type: ShiftType
  custom_start: string | null
  custom_end: string | null
}

export interface FridayMenuItem {
  id: string
  dish_id: string
  friday_price: number
  sort_order: number
  is_active: boolean
  dish?: Dish
}

export interface FridayBooking {
  id: string
  guest_name: string
  guest_phone: string
  num_guests: number
  friday_date: string
  notes: string
  status: BookingStatus
  created_at: string
  items?: FridayBookingItem[]
}

export interface FridayBookingItem {
  id: string
  booking_id: string
  friday_menu_id: string
  quantity: number
}

export interface ExpenseRecurring {
  id: string
  name: string
  amount: number
  frequency: ExpenseFrequency
  start_date: string
  is_active: boolean
}

export interface ExpenseOnetime {
  id: string
  name: string
  amount: number
  date: string
  category: string
  notes: string
}

export interface Settings {
  admin_pin_hash: string
  employee_pin_hash: string
  restaurant_lat: number | null
  restaurant_lng: number | null
  restaurant_radius: number
  table_count: number
  opening_hours: Record<string, { open: string; close: string }>
  shift_hours: Record<string, { start: string; end: string }>
  friday_switch_time: string
  show_employee_salary: boolean
  friday_max_guests: number | null
  friday_enabled: boolean
  loyalty_enabled: boolean
}
