# Jasmine PWA Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Jasmine Restaurant PWA with 3 separate portals (customer, employee, admin), employee management with GPS-based attendance, dynamic Friday dinner system, and detailed financial reports.

**Architecture:** Complete rewrite of routes and layouts. Customer portal simplified to 2 tabs (menu + friday dinner). New employee portal with geofenced attendance and kanban order board. Admin portal redesigned as grid home screen with 8 management sections. All data moves from local JSON to Supabase with Edge Functions for secure operations.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL + Realtime + Edge Functions), Cloudinary, Zustand, TanStack Query, react-i18next, Recharts, date-fns

**Spec:** `docs/superpowers/specs/2026-05-18-jasmine-pwa-redesign.md`

---

## File Structure

### Files to Delete
- `src/pages/customer/LoyaltyJoin.tsx` (removed feature)
- `src/pages/customer/Events.tsx` (replaced by FridayDinner)
- `src/pages/customer/OrderHistory.tsx` (removed feature)
- `src/pages/admin/EventManager.tsx` (replaced by FridayManager)
- `src/pages/admin/MembersList.tsx` (removed feature)
- `src/pages/kitchen/KitchenLogin.tsx` (replaced by StaffLogin)
- `src/pages/kitchen/KitchenBoard.tsx` (replaced by employee portal)
- `src/components/layout/KitchenLayout.tsx` (replaced by EmployeeLayout)
- `src/components/ui/BottomNav.tsx` (rewritten)

### Files to Create
```
src/
  lib/
    types.ts                    — All TypeScript interfaces/types
    constants.ts                — Updated constants (statuses, defaults)
    geo.ts                      — GPS distance calculation utilities
    timezone.ts                 — Asia/Bangkok timezone helpers
    cloudinary.ts               — Cloudinary upload utility

  stores/
    cartStore.ts                — Updated (add createdBy field)
    authStore.ts                — Updated (add 'employee' role)

  hooks/
    useMenu.ts                  — Rewritten: fetch from Supabase
    useRealtimeOrders.ts        — Supabase Realtime subscription
    useSettings.ts              — Fetch public settings
    useFridayStatus.ts          — Check if Friday menu is active
    useGeolocation.ts           — GPS position + distance check

  components/
    layout/
      CustomerLayout.tsx        — Updated: 2-tab nav
      EmployeeLayout.tsx        — New: GPS-gated employee shell
      AdminLayout.tsx           — Rewritten: grid home screen pattern
    ui/
      BottomNav.tsx             — Rewritten: 2 tabs only
      PinInput.tsx              — Existing (keep)
      KanbanBoard.tsx           — New: shared 4-column order board
      OrderKanbanCard.tsx       — New: single order card for kanban
      Modal.tsx                 — Existing (keep)
      LoadingSpinner.tsx        — Existing (keep)
      LanguageSwitcher.tsx      — Existing (keep)
      OfflineBanner.tsx         — Existing (keep)
      StatusBadge.tsx           — Updated: new status colors
      InstallPrompt.tsx         — Existing (keep)
      GeoGate.tsx               — New: blocks content if out of range

  pages/
    customer/
      TableEntry.tsx            — Updated: add staff icon
      Menu.tsx                  — Updated: Friday menu auto-switch
      OrderConfirmation.tsx     — Updated: show total + "excl. service"
      FridayDinner.tsx          — New: advance booking for Friday
      Cart.tsx                  — New: standalone cart page (from drawer)

    staff/
      StaffLogin.tsx            — New: combined admin+employee PIN screen

    employee/
      EmployeeDashboard.tsx     — New: check-in + salary + kanban
      EmployeeNewOrder.tsx      — New: create order for table
      EmployeeSchedule.tsx      — New: view own shifts

    admin/
      AdminHome.tsx             — New: 8-button grid
      Dashboard.tsx             — Rewritten: summary cards + charts
      OrdersManager.tsx         — Rewritten: kanban with 4 statuses
      MenuManager.tsx           — Updated: CRUD with Cloudinary
      DishEditor.tsx            — Updated: 3-language fields
      EmployeeManager.tsx       — New: employee cards list
      EmployeeDetail.tsx        — New: full employee profile
      ScheduleManager.tsx       — New: weekly shift grid
      FridayManager.tsx         — New: Friday menu + bookings
      ReportsPage.tsx           — New: financial dashboard
      ExpensesManager.tsx       — New: recurring + one-time expenses
      Settings.tsx              — Rewritten: all new settings
      QRCodes.tsx               — Updated: dynamic table count

supabase/
  migrations/
    001_redesign_schema.sql     — Complete database schema

  functions/
    validate-pin/index.ts
    submit-order/index.ts
    update-order-status/index.ts
    admin-dishes/index.ts
    admin-categories/index.ts
    admin-employees/index.ts
    admin-attendance/index.ts
    manual-checkin/index.ts
    employee-checkin/index.ts
    employee-salary/index.ts
    admin-schedule/index.ts
    admin-friday/index.ts
    submit-friday-booking/index.ts
    admin-bookings/index.ts
    admin-expenses/index.ts
    admin-reports/index.ts
    admin-settings/index.ts
    public-settings/index.ts
```

---

## Phase 1: Database + Foundation

### Task 1: Database Schema

**Files:**
- Create: `supabase/migrations/001_redesign_schema.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if they exist (from v1)
DROP TABLE IF EXISTS event_bookings CASCADE;
DROP TABLE IF EXISTS event_menus CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS dishes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Enums
CREATE TYPE order_status AS ENUM ('new', 'preparing', 'served', 'paid');
CREATE TYPE pay_type AS ENUM ('hourly', 'daily');
CREATE TYPE shift_type AS ENUM ('morning', 'evening', 'full', 'custom', 'off');
CREATE TYPE expense_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_th TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dishes
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_th TEXT NOT NULL DEFAULT '',
  description_he TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_th TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_kosher BOOLEAN NOT NULL DEFAULT false,
  is_spicy BOOLEAN NOT NULL DEFAULT false,
  is_vegetarian BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number INT NOT NULL,
  status order_status NOT NULL DEFAULT 'new',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id),
  quantity INT NOT NULL DEFAULT 1,
  price_at_order NUMERIC(10,2) NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'waiter',
  photo_url TEXT,
  pay_type pay_type NOT NULL DEFAULT 'daily',
  pay_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT NOT NULL DEFAULT '',
  documents_url TEXT,
  vacation_days INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out TIMESTAMPTZ,
  is_manual BOOLEAN NOT NULL DEFAULT false,
  manual_approved_at TIMESTAMPTZ,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shifts
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_type shift_type NOT NULL DEFAULT 'off',
  custom_start TIME,
  custom_end TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Friday Menu
CREATE TABLE friday_menu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  friday_price NUMERIC(10,2) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Friday Bookings
CREATE TABLE friday_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  num_guests INT NOT NULL DEFAULT 1,
  friday_date DATE NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Friday Booking Items
CREATE TABLE friday_booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES friday_bookings(id) ON DELETE CASCADE,
  friday_menu_id UUID NOT NULL REFERENCES friday_menu(id),
  quantity INT NOT NULL DEFAULT 1
);

-- Friday Cancelled Dates
CREATE TABLE friday_cancelled_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  friday_date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recurring Expenses
CREATE TABLE expenses_recurring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  frequency expense_frequency NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One-time Expenses
CREATE TABLE expenses_onetime (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'other',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settings (single row)
CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_pin_hash TEXT NOT NULL DEFAULT '1111',
  employee_pin_hash TEXT NOT NULL DEFAULT '0000',
  restaurant_lat DOUBLE PRECISION,
  restaurant_lng DOUBLE PRECISION,
  restaurant_radius INT NOT NULL DEFAULT 50,
  table_count INT NOT NULL DEFAULT 30,
  opening_hours JSONB NOT NULL DEFAULT '{}',
  shift_hours JSONB NOT NULL DEFAULT '{"morning":{"start":"10:00","end":"16:00"},"evening":{"start":"17:00","end":"23:00"}}',
  friday_switch_time TIME NOT NULL DEFAULT '14:00',
  show_employee_salary BOOLEAN NOT NULL DEFAULT true,
  friday_max_guests INT,
  friday_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings row
INSERT INTO settings (id) VALUES (1);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dishes_updated_at BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE friday_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE friday_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE friday_booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE friday_cancelled_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses_onetime ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read for menu data
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read dishes" ON dishes FOR SELECT USING (true);
CREATE POLICY "Anyone can read friday_menu" ON friday_menu FOR SELECT USING (true);
CREATE POLICY "Anyone can read friday_cancelled_dates" ON friday_cancelled_dates FOR SELECT USING (true);
CREATE POLICY "Anyone can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can read shifts" ON shifts FOR SELECT USING (true);
CREATE POLICY "Anyone can read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Anyone can read attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Anyone can read friday_bookings" ON friday_bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can read friday_booking_items" ON friday_booking_items FOR SELECT USING (true);
CREATE POLICY "Anyone can read expenses_recurring" ON expenses_recurring FOR SELECT USING (true);
CREATE POLICY "Anyone can read expenses_onetime" ON expenses_onetime FOR SELECT USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

- [ ] **Step 2: Run the migration in Supabase SQL Editor**

Go to Supabase Dashboard → SQL Editor → paste and run. Verify all tables created.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_redesign_schema.sql
git commit -m "feat: add complete database schema for redesign"
```

---

### Task 2: TypeScript Types + Constants

**Files:**
- Rewrite: `src/lib/types.ts` (new file, replaces types in constants.ts)
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// src/lib/types.ts

export type OrderStatus = 'new' | 'preparing' | 'served' | 'paid'
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
}
```

- [ ] **Step 2: Update constants.ts**

```typescript
// src/lib/constants.ts
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
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts
git commit -m "feat: add TypeScript types and updated constants for redesign"
```

---

### Task 3: Utility Libraries

**Files:**
- Create: `src/lib/geo.ts`
- Create: `src/lib/timezone.ts`
- Create: `src/lib/cloudinary.ts`

- [ ] **Step 1: Create geo.ts**

```typescript
// src/lib/geo.ts

export function getDistanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  })
}

export async function isWithinRadius(
  targetLat: number,
  targetLng: number,
  radiusMeters: number
): Promise<{ within: boolean; distance: number; lat: number; lng: number }> {
  const position = await getCurrentPosition()
  const { latitude: lat, longitude: lng } = position.coords
  const distance = getDistanceMeters(lat, lng, targetLat, targetLng)
  return { within: distance <= radiusMeters, distance, lat, lng }
}
```

- [ ] **Step 2: Create timezone.ts**

```typescript
// src/lib/timezone.ts
import { THAILAND_TIMEZONE } from './constants'

export function nowInThailand(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: THAILAND_TIMEZONE })
  )
}

export function isFriday(): boolean {
  return nowInThailand().getDay() === 5
}

export function isPastFridaySwitchTime(switchTime: string): boolean {
  if (!isFriday()) return false
  const now = nowInThailand()
  const [hours, minutes] = switchTime.split(':').map(Number)
  const switchDate = new Date(now)
  switchDate.setHours(hours, minutes, 0, 0)
  return now >= switchDate
}

export function formatThaiDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    timeZone: THAILAND_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatThaiTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('th-TH', {
    timeZone: THAILAND_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getNextFriday(): Date {
  const now = nowInThailand()
  const day = now.getDay()
  const daysUntilFriday = (5 - day + 7) % 7 || 7
  const next = new Date(now)
  next.setDate(next.getDate() + daysUntilFriday)
  next.setHours(0, 0, 0, 0)
  return next
}
```

- [ ] **Step 3: Create cloudinary.ts**

```typescript
// src/lib/cloudinary.ts

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'jasmine_unsigned'

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json()
  return data.secure_url
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/geo.ts src/lib/timezone.ts src/lib/cloudinary.ts
git commit -m "feat: add geo, timezone, and cloudinary utility libraries"
```

---

### Task 4: Update Stores

**Files:**
- Modify: `src/stores/authStore.ts`
- Modify: `src/stores/cartStore.ts`

- [ ] **Step 1: Rewrite authStore.ts**

```typescript
// src/stores/authStore.ts
import { create } from 'zustand'
import { callEdgeFunction, isSupabaseConfigured } from '../lib/supabase'
import type { UserRole } from '../lib/types'
import { DEFAULT_ADMIN_PIN, DEFAULT_EMPLOYEE_PIN } from '../lib/constants'

interface AuthState {
  role: UserRole
  validatePin: (pin: string, role: 'employee' | 'admin') => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  role: (sessionStorage.getItem('jasmine-role') as UserRole) || 'guest',

  validatePin: async (pin: string, role: 'employee' | 'admin') => {
    let valid = false
    if (!isSupabaseConfigured) {
      valid = role === 'admin' ? pin === DEFAULT_ADMIN_PIN : pin === DEFAULT_EMPLOYEE_PIN
    } else {
      try {
        const result = await callEdgeFunction('validate-pin', { pin, role })
        valid = result.valid
      } catch {
        valid = false
      }
    }
    if (valid) {
      sessionStorage.setItem('jasmine-role', role)
      set({ role })
    }
    return valid
  },

  logout: () => {
    sessionStorage.removeItem('jasmine-role')
    set({ role: 'guest' })
  },
}))
```

- [ ] **Step 2: Update cartStore.ts — add createdBy field**

Add `createdBy: 'customer' | 'employee'` to the store state and `setCreatedBy` action. Default is `'customer'`. When employee creates an order, set it to `'employee'`.

In `src/stores/cartStore.ts`, add to the interface:
```typescript
createdBy: 'customer' | 'employee'
setCreatedBy: (by: 'customer' | 'employee') => void
```

In the store implementation, add:
```typescript
createdBy: 'customer',
setCreatedBy: (by) => set({ createdBy: by }),
```

Update `clear` to also reset: `createdBy: 'customer'`.

- [ ] **Step 3: Commit**

```bash
git add src/stores/authStore.ts src/stores/cartStore.ts
git commit -m "feat: update stores for employee role and order source tracking"
```

---

### Task 5: Core Hooks

**Files:**
- Rewrite: `src/hooks/useMenu.ts`
- Create: `src/hooks/useSettings.ts`
- Create: `src/hooks/useFridayStatus.ts`
- Create: `src/hooks/useGeolocation.ts`
- Create: `src/hooks/useRealtimeOrders.ts`

- [ ] **Step 1: Rewrite useMenu.ts to fetch from Supabase**

```typescript
// src/hooks/useMenu.ts
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Category, Dish } from '../lib/types'
import menuRaw from '../data/menu-raw.json'

async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) {
    return (menuRaw as any).categories.map((c: any, i: number) => ({
      id: c.id, name_he: c.name_he, name_en: c.name_en,
      name_th: c.name_th || '', sort_order: i,
    }))
  }
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data
}

async function fetchDishes(): Promise<Dish[]> {
  if (!isSupabaseConfigured) {
    return (menuRaw as any).dishes.map((d: any, i: number) => ({
      id: `dish-${i}`, category_id: '', name_he: d.name_he,
      name_en: d.name_en, name_th: d.name_th || d.name_en,
      description_he: d.description_he, description_en: d.description_en,
      description_th: '', price: d.price, image_url: d.image_url || null,
      is_kosher: d.is_kosher || false, is_spicy: false, is_vegetarian: false,
      is_available: true, sort_order: i,
    }))
  }
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('is_available', true)
    .order('sort_order')
  if (error) throw error
  return data
}

export function useMenu() {
  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  })

  const { data: dishes = [], isLoading: dishesLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: fetchDishes,
    staleTime: 5 * 60 * 1000,
  })

  const getDishesByCategory = (categoryId: string) =>
    dishes.filter((d) => d.category_id === categoryId)

  return { categories, dishes, getDishesByCategory, isLoading: catsLoading || dishesLoading }
}
```

- [ ] **Step 2: Create useSettings.ts**

```typescript
// src/hooks/useSettings.ts
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Settings } from '../lib/types'

const DEFAULT_SETTINGS: Settings = {
  admin_pin_hash: '1111',
  employee_pin_hash: '0000',
  restaurant_lat: null,
  restaurant_lng: null,
  restaurant_radius: 50,
  table_count: 30,
  opening_hours: {},
  shift_hours: {
    morning: { start: '10:00', end: '16:00' },
    evening: { start: '17:00', end: '23:00' },
  },
  friday_switch_time: '14:00',
  show_employee_salary: true,
  friday_max_guests: null,
  friday_enabled: true,
}

async function fetchSettings(): Promise<Settings> {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()
  if (error) throw error
  return data
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 60 * 1000,
  })
}
```

- [ ] **Step 3: Create useFridayStatus.ts**

```typescript
// src/hooks/useFridayStatus.ts
import { useMemo } from 'react'
import { useSettings } from './useSettings'
import { isFriday, isPastFridaySwitchTime } from '../lib/timezone'

export function useFridayStatus() {
  const { data: settings } = useSettings()

  return useMemo(() => {
    if (!settings?.friday_enabled) {
      return { isFridayMenuActive: false, isFridayDay: false }
    }
    const fridayDay = isFriday()
    const pastSwitch = isPastFridaySwitchTime(settings.friday_switch_time)
    return {
      isFridayMenuActive: fridayDay && pastSwitch,
      isFridayDay: fridayDay,
    }
  }, [settings])
}
```

- [ ] **Step 4: Create useGeolocation.ts**

```typescript
// src/hooks/useGeolocation.ts
import { useState, useCallback } from 'react'
import { isWithinRadius } from '../lib/geo'
import { useSettings } from './useSettings'

interface GeoState {
  checking: boolean
  within: boolean | null
  distance: number | null
  error: string | null
}

export function useGeolocation() {
  const { data: settings } = useSettings()
  const [state, setState] = useState<GeoState>({
    checking: false, within: null, distance: null, error: null,
  })

  const checkLocation = useCallback(async () => {
    if (!settings?.restaurant_lat || !settings?.restaurant_lng) {
      setState({ checking: false, within: true, distance: 0, error: null })
      return true
    }
    setState((s) => ({ ...s, checking: true, error: null }))
    try {
      const result = await isWithinRadius(
        settings.restaurant_lat,
        settings.restaurant_lng,
        settings.restaurant_radius
      )
      setState({
        checking: false,
        within: result.within,
        distance: Math.round(result.distance),
        error: null,
      })
      return result.within
    } catch (err) {
      setState({
        checking: false, within: false, distance: null,
        error: err instanceof Error ? err.message : 'Location error',
      })
      return false
    }
  }, [settings])

  return { ...state, checkLocation }
}
```

- [ ] **Step 5: Create useRealtimeOrders.ts**

```typescript
// src/hooks/useRealtimeOrders.ts
import { useEffect, useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Order, OrderItem } from '../lib/types'

async function fetchTodayOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return []
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export function useRealtimeOrders() {
  const queryClient = useQueryClient()
  const audioRef = useRef<AudioContext | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders-today'],
    queryFn: fetchTodayOrders,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders-today'] })
          playNotificationSound()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  function playNotificationSound() {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext()
      }
      const ctx = audioRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }

  const getOrdersByStatus = (status: string) =>
    orders.filter((o) => o.status === status)

  return { orders, isLoading, getOrdersByStatus }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useMenu.ts src/hooks/useSettings.ts src/hooks/useFridayStatus.ts src/hooks/useGeolocation.ts src/hooks/useRealtimeOrders.ts
git commit -m "feat: add core hooks for menu, settings, geolocation, and realtime orders"
```

---

### Task 6: Update i18n Locale Files

**Files:**
- Modify: `src/locales/he.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/th.json`

- [ ] **Step 1: Update all three locale files**

Add new keys for all new features. Key sections to add:

```json
{
  "staff": {
    "title": "כניסת צוות",
    "adminLogin": "כניסת מנהל",
    "employeeLogin": "כניסת עובדים",
    "enterPin": "הזן קוד 4 ספרות",
    "invalidPin": "קוד שגוי",
    "tooManyAttempts": "יותר מדי ניסיונות, נסה שוב מאוחר יותר"
  },
  "employee": {
    "title": "מסך עובדים",
    "checkIn": "התחל משמרת",
    "checkOut": "סיים משמרת",
    "shiftTimer": "זמן במשמרת",
    "salary": "שכר מצטבר החודש",
    "newOrder": "הזמנה חדשה",
    "selectTable": "בחר שולחן",
    "outOfRange": "אתה מחוץ לטווח המסעדה",
    "locationRequired": "נדרשת גישה למיקום",
    "schedule": "תכנית עבודה",
    "myShifts": "המשמרות שלי"
  },
  "friday": {
    "title": "ארוחת שישי",
    "bookTitle": "הזמנת מקום לארוחת שישי",
    "guestName": "שם מלא",
    "guestPhone": "טלפון",
    "numGuests": "מספר אורחים",
    "selectDishes": "בחר מנות",
    "totalPrice": "סה\"כ",
    "submitBooking": "שלח הזמנה",
    "bookingConfirmed": "ההזמנה התקבלה!",
    "cancelled": "ארוחת שישי בוטלה השבוע",
    "noMenu": "אין תפריט שישי",
    "fridayMenu": "תפריט שישי"
  },
  "kanban": {
    "new": "חדשה",
    "preparing": "בהכנה",
    "served": "הוגשה",
    "paid": "שולמה"
  },
  "adminHome": {
    "dashboard": "דשבורד",
    "orders": "הזמנות",
    "menuManage": "ניהול תפריט",
    "employees": "ניהול עובדים",
    "schedule": "תכנית עבודה",
    "friday": "ארוחת שישי",
    "reports": "דוחות כספיים",
    "settings": "הגדרות"
  },
  "employees": {
    "addEmployee": "הוסף עובד",
    "editEmployee": "ערוך עובד",
    "fullName": "שם מלא",
    "phone": "טלפון",
    "role": "תפקיד",
    "payType": "סוג שכר",
    "payRate": "סכום שכר",
    "hourly": "שעתי",
    "daily": "יומי",
    "startDate": "תאריך התחלה",
    "active": "פעיל",
    "inactive": "לא פעיל",
    "cook": "טבח",
    "waiter": "מלצר",
    "bartender": "ברמן",
    "other": "אחר",
    "attendance": "נוכחות",
    "manualCheckin": "צ'ק-אין ידני",
    "documents": "מסמכים",
    "vacationDays": "ימי חופש",
    "monthlySalary": "סיכום שכר חודשי"
  },
  "schedule": {
    "title": "תכנית עבודה",
    "morning": "בוקר",
    "evening": "ערב",
    "fullDay": "יום מלא",
    "off": "חופש",
    "custom": "מותאם",
    "copyWeek": "העתק שבוע",
    "shiftHours": "שעות משמרות"
  },
  "reports": {
    "title": "דוחות כספיים",
    "revenue": "הכנסות",
    "expenses": "הוצאות",
    "profit": "רווח נקי",
    "employeeCosts": "עלות עובדים",
    "recurringExpenses": "הוצאות חוזרות",
    "oneTimeExpenses": "הוצאות חד-פעמיות",
    "addExpense": "הוסף הוצאה",
    "filterByDate": "סנן לפי תאריכים",
    "today": "היום",
    "thisWeek": "השבוע",
    "thisMonth": "החודש",
    "customRange": "טווח מותאם"
  },
  "settings": {
    "adminPin": "קוד מנהל",
    "employeePin": "קוד עובדים",
    "restaurantLocation": "מיקום מסעדה",
    "setCurrentLocation": "הגדר מיקום נוכחי",
    "tableCount": "מספר שולחנות",
    "openingHours": "שעות פתיחה",
    "shiftHours": "שעות משמרות",
    "fridaySwitchTime": "שעת מעבר לתפריט שישי",
    "showEmployeeSalary": "הצג שכר לעובדים",
    "qrCodes": "קודי QR",
    "save": "שמור",
    "saved": "נשמר בהצלחה"
  },
  "order": {
    "confirmation": "אישור הזמנה",
    "orderNumber": "מספר הזמנה",
    "thankYou": "תודה על הזמנתך!",
    "total": "סה\"כ",
    "excludingService": "לא כולל שירות",
    "newOrder": "הזמנה חדשה"
  }
}
```

Create the equivalent keys in `en.json` (English) and `th.json` (Thai). The Thai translations for employee-facing strings are critical since the employee portal defaults to Thai.

- [ ] **Step 2: Commit**

```bash
git add src/locales/he.json src/locales/en.json src/locales/th.json
git commit -m "feat: add i18n keys for all new features"
```

---

## Phase 2: Customer Portal Redesign

### Task 7: Staff Icon + Updated Table Entry

**Files:**
- Modify: `src/pages/customer/TableEntry.tsx`

- [ ] **Step 1: Add small gear icon in corner that links to /staff**

Update TableEntry to include a semi-transparent settings icon in the bottom-right corner. On click, navigate to `/staff`. Also use dynamic `table_count` from settings instead of hardcoded 30.

```typescript
// Add to imports:
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'

// In the component, add the icon:
<button
  onClick={() => navigate('/staff')}
  className="fixed bottom-4 right-4 p-2 text-white/20 hover:text-white/40 transition-colors"
  aria-label="Staff"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
</button>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/customer/TableEntry.tsx
git commit -m "feat: add staff access icon to table entry screen"
```

---

### Task 8: Staff Login Screen

**Files:**
- Create: `src/pages/staff/StaffLogin.tsx`

- [ ] **Step 1: Create StaffLogin with two PIN entries**

```typescript
// src/pages/staff/StaffLogin.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import PinInput from '../../components/ui/PinInput'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'

type LoginMode = null | 'admin' | 'employee'

export default function StaffLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const validatePin = useAuthStore((s) => s.validatePin)
  const [mode, setMode] = useState<LoginMode>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(pin: string) {
    if (!mode) return
    setLoading(true)
    setError('')
    const valid = await validatePin(pin, mode)
    setLoading(false)
    if (valid) {
      navigate(mode === 'admin' ? '/admin' : '/employee')
    } else {
      setError(t('staff.invalidPin'))
    }
  }

  if (mode) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
        <h1 className="text-2xl text-[#c9a84c] mb-2">
          {mode === 'admin' ? t('staff.adminLogin') : t('staff.employeeLogin')}
        </h1>
        <p className="text-gray-400 text-sm mb-8">{t('staff.enterPin')}</p>
        <PinInput length={4} onComplete={handleSubmit} disabled={loading} />
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        <button
          onClick={() => { setMode(null); setError('') }}
          className="mt-8 text-gray-500 text-sm hover:text-gray-300"
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-4 gap-6">
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
      <h1 className="text-3xl text-[#c9a84c] mb-4">{t('staff.title')}</h1>
      <button
        onClick={() => setMode('admin')}
        className="w-64 py-4 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl text-[#c9a84c] text-lg font-medium hover:bg-[#c9a84c]/20 transition-colors"
      >
        {t('staff.adminLogin')}
      </button>
      <button
        onClick={() => setMode('employee')}
        className="w-64 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-lg font-medium hover:bg-white/10 transition-colors"
      >
        {t('staff.employeeLogin')}
      </button>
      <button
        onClick={() => navigate('/')}
        className="mt-4 text-gray-500 text-sm hover:text-gray-300"
      >
        {t('common.back')}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/staff/StaffLogin.tsx
git commit -m "feat: add staff login screen with admin and employee PIN entry"
```

---

### Task 9: Update Customer Layout + Bottom Nav

**Files:**
- Modify: `src/components/ui/BottomNav.tsx`
- Modify: `src/components/layout/CustomerLayout.tsx`

- [ ] **Step 1: Rewrite BottomNav with only 2 tabs**

```typescript
// src/components/ui/BottomNav.tsx
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()

  const tabs = [
    { to: '/menu', label: t('nav.menu'), icon: '🍽️' },
    { to: '/friday-dinner', label: t('friday.title'), icon: '🕯️' },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#121212] border-t border-[#c9a84c]/20">
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2.5 px-6 text-xs transition-colors ${
                isActive ? 'text-[#c9a84c]' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <span className="text-lg mb-0.5">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/BottomNav.tsx src/components/layout/CustomerLayout.tsx
git commit -m "feat: simplify customer nav to 2 tabs (menu + friday dinner)"
```

---

### Task 10: Update Order Confirmation

**Files:**
- Modify: `src/pages/customer/OrderConfirmation.tsx`

- [ ] **Step 1: Add total amount + "excluding service" text**

Update the confirmation screen to display the order total prominently with the text "לא כולל שירות" / "Excluding service" / "ไม่รวมค่าบริการ" below it.

- [ ] **Step 2: Commit**

```bash
git add src/pages/customer/OrderConfirmation.tsx
git commit -m "feat: show order total with 'excluding service' note on confirmation"
```

---

### Task 11: Friday Dinner Customer Page

**Files:**
- Create: `src/pages/customer/FridayDinner.tsx`

- [ ] **Step 1: Create FridayDinner booking page**

Page that shows the Friday dinner menu items fetched from `friday_menu` table (joined with `dishes`), with prices. Customer fills in: name, phone, number of guests, selects dishes with quantities. Submits via `submit-friday-booking` Edge Function.

Shows "cancelled this week" message if the current Friday is in `friday_cancelled_dates`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/customer/FridayDinner.tsx
git commit -m "feat: add Friday dinner advance booking page for customers"
```

---

### Task 12: Menu Friday Auto-Switch

**Files:**
- Modify: `src/pages/customer/Menu.tsx`

- [ ] **Step 1: Add Friday menu detection**

Use `useFridayStatus()` hook. When `isFridayMenuActive` is true, fetch dishes from `friday_menu` (with joined dish data) instead of regular menu. Show a banner "תפריט שישי" at the top. Use `friday_price` instead of regular `price`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/customer/Menu.tsx
git commit -m "feat: auto-switch to Friday menu on Friday after configured time"
```

---

## Phase 3: Employee Portal

### Task 13: GeoGate Component

**Files:**
- Create: `src/components/ui/GeoGate.tsx`

- [ ] **Step 1: Create GeoGate wrapper**

```typescript
// src/components/ui/GeoGate.tsx
import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useGeolocation } from '../../hooks/useGeolocation'
import LoadingSpinner from './LoadingSpinner'

interface GeoGateProps {
  children: ReactNode
}

export default function GeoGate({ children }: GeoGateProps) {
  const { t } = useTranslation()
  const { checking, within, distance, error, checkLocation } = useGeolocation()

  useEffect(() => {
    checkLocation()
  }, [checkLocation])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">{t('employee.locationRequired')}</p>
      </div>
    )
  }

  if (!within) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4">📍</div>
        <h2 className="text-xl text-red-400 mb-2">{t('employee.outOfRange')}</h2>
        {distance !== null && (
          <p className="text-gray-500 text-sm mb-6">
            {distance}m away
          </p>
        )}
        {error && <p className="text-red-400/60 text-xs mb-4">{error}</p>}
        <button
          onClick={checkLocation}
          className="px-6 py-2 bg-[#c9a84c]/20 text-[#c9a84c] rounded-lg hover:bg-[#c9a84c]/30 transition-colors"
        >
          {t('common.confirm')}
        </button>
      </div>
    )
  }

  return <>{children}</>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/GeoGate.tsx
git commit -m "feat: add GeoGate component for GPS-based access control"
```

---

### Task 14: Employee Layout

**Files:**
- Create: `src/components/layout/EmployeeLayout.tsx`

- [ ] **Step 1: Create EmployeeLayout with GeoGate wrapping**

Layout that wraps employee pages with GeoGate, header with language switcher, and bottom navigation (if needed). Since the employee portal is simpler, use a top header with the employee's shift status and navigation links.

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/EmployeeLayout.tsx
git commit -m "feat: add employee layout with GPS gating"
```

---

### Task 15: Employee Dashboard

**Files:**
- Create: `src/pages/employee/EmployeeDashboard.tsx`

- [ ] **Step 1: Create main employee screen**

Three sections:
1. **Check-in/Check-out** — large button, timer showing shift duration, GPS verification
2. **Salary summary** — accumulated salary this month (if `show_employee_salary` is enabled in settings), calculated from attendance records × pay rate
3. **Quick actions** — "New Order" button + "My Schedule" button

Below: Kanban order board (reuses shared KanbanBoard component from Task 16).

- [ ] **Step 2: Commit**

```bash
git add src/pages/employee/EmployeeDashboard.tsx
git commit -m "feat: add employee dashboard with check-in, salary, and orders"
```

---

### Task 16: Shared Kanban Board Component

**Files:**
- Create: `src/components/ui/KanbanBoard.tsx`
- Create: `src/components/ui/OrderKanbanCard.tsx`

- [ ] **Step 1: Create KanbanBoard — 4 columns**

```typescript
// src/components/ui/KanbanBoard.tsx
import { useTranslation } from 'react-i18next'
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders'
import { ORDER_STATUS_COLORS } from '../../lib/constants'
import OrderKanbanCard from './OrderKanbanCard'
import type { OrderStatus } from '../../lib/types'

const COLUMNS: { status: OrderStatus; labelKey: string }[] = [
  { status: 'new', labelKey: 'kanban.new' },
  { status: 'preparing', labelKey: 'kanban.preparing' },
  { status: 'served', labelKey: 'kanban.served' },
  { status: 'paid', labelKey: 'kanban.paid' },
]

interface KanbanBoardProps {
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
}

export default function KanbanBoard({ onStatusChange }: KanbanBoardProps) {
  const { t } = useTranslation()
  const { orders, isLoading, getOrdersByStatus } = useRealtimeOrders()

  if (isLoading) return <div className="text-center text-gray-500 py-8">...</div>

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
      {COLUMNS.map((col) => {
        const colOrders = getOrdersByStatus(col.status)
        const color = ORDER_STATUS_COLORS[col.status]
        return (
          <div key={col.status} className="flex-shrink-0 w-72 flex flex-col">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-t-lg mb-2"
              style={{ backgroundColor: `${color}20`, borderBottom: `2px solid ${color}` }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm font-medium text-white">{t(col.labelKey)}</span>
              <span className="text-xs text-gray-400 ml-auto">{colOrders.length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {colOrders.map((order) => (
                <OrderKanbanCard
                  key={order.id}
                  order={order}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create OrderKanbanCard**

Card showing: table number, item list, notes, time elapsed, and forward/backward status buttons.

```typescript
// src/components/ui/OrderKanbanCard.tsx
import { useTranslation } from 'react-i18next'
import { ORDER_STATUSES } from '../../lib/constants'
import type { Order, OrderStatus } from '../../lib/types'

interface Props {
  order: Order
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
}

export default function OrderKanbanCard({ order, onStatusChange }: Props) {
  const { i18n } = useTranslation()
  const currentIndex = ORDER_STATUSES.indexOf(order.status as any)
  const canAdvance = currentIndex < ORDER_STATUSES.length - 1
  const canRevert = currentIndex > 0

  const minutesAgo = Math.floor(
    (Date.now() - new Date(order.created_at).getTime()) / 60000
  )

  const langKey = i18n.language === 'he' ? 'name_he'
    : i18n.language === 'th' ? 'name_th' : 'name_en'

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[#c9a84c] font-bold text-lg">#{order.table_number}</span>
        <span className="text-gray-500 text-xs">{minutesAgo}m</span>
      </div>

      {order.items?.map((item) => (
        <div key={item.id} className="text-sm text-gray-300 flex justify-between">
          <span>{item.quantity}× {(item as any)[langKey] || item.dish_id}</span>
        </div>
      ))}

      {order.notes && (
        <p className="text-xs text-yellow-400/70 mt-1 italic">{order.notes}</p>
      )}

      <div className="flex gap-2 mt-3">
        {canRevert && (
          <button
            onClick={() => onStatusChange(order.id, ORDER_STATUSES[currentIndex - 1] as OrderStatus)}
            className="flex-1 py-1.5 text-xs bg-white/5 text-gray-400 rounded hover:bg-white/10 transition-colors"
          >
            ◀
          </button>
        )}
        {canAdvance && (
          <button
            onClick={() => onStatusChange(order.id, ORDER_STATUSES[currentIndex + 1] as OrderStatus)}
            className="flex-1 py-1.5 text-xs bg-[#c9a84c]/20 text-[#c9a84c] rounded hover:bg-[#c9a84c]/30 transition-colors font-medium"
          >
            ▶
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/KanbanBoard.tsx src/components/ui/OrderKanbanCard.tsx
git commit -m "feat: add shared kanban board with 4 colored status columns"
```

---

### Task 17: Employee New Order + Schedule Pages

**Files:**
- Create: `src/pages/employee/EmployeeNewOrder.tsx`
- Create: `src/pages/employee/EmployeeSchedule.tsx`

- [ ] **Step 1: Create EmployeeNewOrder**

Step 1: Select table number from grid. Step 2: Show menu (or Friday menu if active). Step 3: Add items to cart. Step 4: Submit order with `created_by: 'employee'`.

Uses existing cart store with `setCreatedBy('employee')`.

- [ ] **Step 2: Create EmployeeSchedule**

Read-only view of the current employee's shifts for this week and next week. Fetches from `shifts` table. Shows shift type + hours in a clean daily list.

- [ ] **Step 3: Commit**

```bash
git add src/pages/employee/EmployeeNewOrder.tsx src/pages/employee/EmployeeSchedule.tsx
git commit -m "feat: add employee new order and schedule view pages"
```

---

## Phase 4: Admin Portal Redesign

### Task 18: Admin Home Grid

**Files:**
- Create: `src/pages/admin/AdminHome.tsx`
- Rewrite: `src/components/layout/AdminLayout.tsx`

- [ ] **Step 1: Create AdminHome — 8-button grid**

```typescript
// src/pages/admin/AdminHome.tsx
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import { useAuthStore } from '../../stores/authStore'

const BUTTONS = [
  { key: 'dashboard', icon: '📊', path: '/admin/dashboard' },
  { key: 'orders', icon: '🍽️', path: '/admin/orders' },
  { key: 'menuManage', icon: '📋', path: '/admin/menu' },
  { key: 'employees', icon: '👥', path: '/admin/employees' },
  { key: 'schedule', icon: '📅', path: '/admin/schedule' },
  { key: 'friday', icon: '🕯️', path: '/admin/friday' },
  { key: 'reports', icon: '💰', path: '/admin/reports' },
  { key: 'settings', icon: '⚙️', path: '/admin/settings' },
]

export default function AdminHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="min-h-screen bg-[#080808] p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#c9a84c]">{t('admin.title')}</h1>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {BUTTONS.map((btn) => (
            <button
              key={btn.key}
              onClick={() => navigate(btn.path)}
              className="flex flex-col items-center justify-center gap-2 p-6 bg-[#121212] border border-[#c9a84c]/15 rounded-xl hover:bg-[#1a1a1a] hover:border-[#c9a84c]/30 transition-all"
            >
              <span className="text-3xl">{btn.icon}</span>
              <span className="text-sm text-gray-300">{t(`adminHome.${btn.key}`)}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full mt-8 py-3 text-sm text-red-400/60 hover:text-red-400 transition-colors"
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Simplify AdminLayout to just a back-button header**

Since the admin uses a home grid, each sub-page gets a simple header with "back" button instead of a sidebar.

```typescript
// src/components/layout/AdminLayout.tsx
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../ui/LanguageSwitcher'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#080808]">
      <header className="sticky top-0 z-30 bg-[#121212] border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/admin')}
            className="text-[#c9a84c] text-sm hover:text-[#d4b96a] transition-colors"
          >
            ← {t('common.back')}
          </button>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminHome.tsx src/components/layout/AdminLayout.tsx
git commit -m "feat: redesign admin portal with 8-button home grid"
```

---

### Task 19: Admin Orders (Kanban)

**Files:**
- Rewrite: `src/pages/admin/OrdersManager.tsx`

- [ ] **Step 1: Rewrite OrdersManager to use shared KanbanBoard**

Uses `KanbanBoard` component + `callEdgeFunction('update-order-status', { orderId, status })` for status changes.

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/OrdersManager.tsx
git commit -m "feat: rewrite admin orders page with kanban board"
```

---

### Task 20: Employee Management

**Files:**
- Create: `src/pages/admin/EmployeeManager.tsx`
- Create: `src/pages/admin/EmployeeDetail.tsx`

- [ ] **Step 1: Create EmployeeManager — card grid view**

Fetches employees from Supabase. Shows cards with: avatar circle (first letter), name, role, pay info, status badge, WhatsApp button (`https://wa.me/{phone}`), phone button (`tel:{phone}`). Click card → navigate to `/admin/employees/:id`.

"Add Employee" button opens a modal/page with form fields for all employee data.

- [ ] **Step 2: Create EmployeeDetail — full profile**

Shows all employee data. Tabs/sections:
- Profile info (editable)
- Attendance history (table with check-in/out times, manual flag, edit button)
- Monthly salary summary
- Manual check-in button (for GPS override, marks as `is_manual: true`)
- Document upload (photo of passport/visa → Cloudinary)

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/EmployeeManager.tsx src/pages/admin/EmployeeDetail.tsx
git commit -m "feat: add employee management with cards and detail view"
```

---

### Task 21: Schedule Manager

**Files:**
- Create: `src/pages/admin/ScheduleManager.tsx`

- [ ] **Step 1: Create weekly schedule grid**

Table with rows = active employees, columns = days (Sunday-Saturday). Each cell shows shift type (colored badge). Click cell → dropdown to select shift type (morning/evening/full/custom/off). For "custom" — show time pickers for start/end.

Week navigation (prev/next week). "Copy Previous Week" button.

Shift hours shown in header based on `settings.shift_hours`.

Save changes via `admin-schedule` Edge Function.

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/ScheduleManager.tsx
git commit -m "feat: add weekly schedule manager with shift assignment grid"
```

---

### Task 22: Friday Manager (Admin)

**Files:**
- Create: `src/pages/admin/FridayManager.tsx`

- [ ] **Step 1: Create Friday dinner management page**

Two sections:
1. **Friday Menu** — list of dishes assigned to Friday dinner with special prices. Add dish from regular menu, set Friday price, toggle active. Save via `admin-friday` Edge Function.

2. **Bookings** — list of upcoming Friday bookings with guest name, phone, guest count, selected dishes, status. Confirm/Cancel buttons. Filter by date.

3. **Cancel Friday** — button to cancel this week's Friday dinner (adds date to `friday_cancelled_dates`).

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/FridayManager.tsx
git commit -m "feat: add Friday dinner management for admin"
```

---

### Task 23: Admin Dashboard

**Files:**
- Rewrite: `src/pages/admin/Dashboard.tsx`

- [ ] **Step 1: Rewrite dashboard with summary cards and charts**

Cards: Today's orders count, Today's revenue (sum of paid orders), Average order value, Orders by status (4 colored badges).

Charts (Recharts):
- Hourly order distribution today (BarChart)
- Revenue last 7 days (BarChart)

Data fetched via `admin-reports` Edge Function or direct Supabase queries.

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/Dashboard.tsx
git commit -m "feat: rewrite admin dashboard with summary cards and charts"
```

---

## Phase 5: Financial Reports + Expenses

### Task 24: Reports Page

**Files:**
- Create: `src/pages/admin/ReportsPage.tsx`

- [ ] **Step 1: Create detailed financial reports dashboard**

Date range filter (today, this week, this month, custom range).

Summary cards: Revenue, Expenses (total), Net Profit.

Charts:
- Revenue over time (BarChart)
- Expenses by category (PieChart — employee costs, recurring, one-time)
- Profit over time (LineChart)
- Employee costs breakdown (table)

Fetch data via `admin-reports` Edge Function which aggregates: orders (paid, in date range), attendance × pay rates, recurring expenses (prorated), one-time expenses.

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/ReportsPage.tsx
git commit -m "feat: add detailed financial reports with charts and date filtering"
```

---

### Task 25: Expenses Manager

**Files:**
- Create: `src/pages/admin/ExpensesManager.tsx`

- [ ] **Step 1: Create expenses management page**

Two tabs:
1. **Recurring Expenses** — table with name, amount, frequency, start date, active toggle. Add/Edit/Delete.
2. **One-time Expenses** — table with name, amount, date, category. Add/Delete.

CRUD via `admin-expenses` Edge Function.

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/ExpensesManager.tsx
git commit -m "feat: add recurring and one-time expenses management"
```

---

## Phase 6: Settings + QR Codes

### Task 26: Rewrite Settings Page

**Files:**
- Rewrite: `src/pages/admin/Settings.tsx`

- [ ] **Step 1: Rewrite Settings with all new fields**

Sections:
1. **PINs** — Admin PIN (4 digits), Employee PIN (4 digits)
2. **Restaurant Location** — "Set Current Location" button (uses GPS), shows lat/lng, radius input
3. **Tables** — Table count input (1-100)
4. **Opening Hours** — 7-day grid with open/close time inputs per day
5. **Shift Hours** — Morning start/end, Evening start/end
6. **Friday** — Switch time input, max guests input, enable/disable toggle
7. **Employee Settings** — Show salary to employees toggle

Save via `admin-settings` Edge Function.

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/Settings.tsx
git commit -m "feat: rewrite settings with location, shifts, friday, and employee options"
```

---

### Task 27: Update QR Codes Page

**Files:**
- Modify: `src/pages/admin/QRCodes.tsx`

- [ ] **Step 1: Use dynamic table count from settings**

Replace hardcoded `TABLE_MAX = 30` with `settings.table_count`. Generate QR codes for tables 1 through `table_count`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/QRCodes.tsx
git commit -m "feat: use dynamic table count for QR code generation"
```

---

## Phase 7: Routing + Cleanup

### Task 28: Update App.tsx Routing

**Files:**
- Rewrite: `src/App.tsx`

- [ ] **Step 1: Rewrite all routes**

```typescript
// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { useAuthStore } from './stores/authStore'
import CustomerLayout from './components/layout/CustomerLayout'
import TableEntry from './pages/customer/TableEntry'
import Menu from './pages/customer/Menu'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import FridayDinner from './pages/customer/FridayDinner'

const StaffLogin = lazy(() => import('./pages/staff/StaffLogin'))
const EmployeeLayout = lazy(() => import('./components/layout/EmployeeLayout'))
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'))
const EmployeeNewOrder = lazy(() => import('./pages/employee/EmployeeNewOrder'))
const EmployeeSchedule = lazy(() => import('./pages/employee/EmployeeSchedule'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const MenuManager = lazy(() => import('./pages/admin/MenuManager'))
const DishEditor = lazy(() => import('./pages/admin/DishEditor'))
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'))
const EmployeeManager = lazy(() => import('./pages/admin/EmployeeManager'))
const EmployeeDetail = lazy(() => import('./pages/admin/EmployeeDetail'))
const ScheduleManager = lazy(() => import('./pages/admin/ScheduleManager'))
const FridayManager = lazy(() => import('./pages/admin/FridayManager'))
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'))
const ExpensesManager = lazy(() => import('./pages/admin/ExpensesManager'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const QRCodes = lazy(() => import('./pages/admin/QRCodes'))

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080808]">
      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children, requiredRole, loginPath }: {
  children: ReactNode
  requiredRole: 'employee' | 'admin'
  loginPath: string
}) {
  const role = useAuthStore((s) => s.role)
  if (role !== requiredRole && role !== 'admin') {
    return <Navigate to={loginPath} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          {/* Customer */}
          <Route path="/" element={<TableEntry />} />
          <Route path="/menu" element={<CustomerLayout><Menu /></CustomerLayout>} />
          <Route path="/order-confirmation" element={<CustomerLayout><OrderConfirmation /></CustomerLayout>} />
          <Route path="/friday-dinner" element={<CustomerLayout><FridayDinner /></CustomerLayout>} />

          {/* Staff Login */}
          <Route path="/staff" element={<StaffLogin />} />

          {/* Employee */}
          <Route path="/employee" element={
            <ProtectedRoute requiredRole="employee" loginPath="/staff">
              <EmployeeLayout><EmployeeDashboard /></EmployeeLayout>
            </ProtectedRoute>
          } />
          <Route path="/employee/new-order" element={
            <ProtectedRoute requiredRole="employee" loginPath="/staff">
              <EmployeeLayout><EmployeeNewOrder /></EmployeeLayout>
            </ProtectedRoute>
          } />
          <Route path="/employee/schedule" element={
            <ProtectedRoute requiredRole="employee" loginPath="/staff">
              <EmployeeLayout><EmployeeSchedule /></EmployeeLayout>
            </ProtectedRoute>
          } />

          {/* Admin Home */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminHome />
            </ProtectedRoute>
          } />

          {/* Admin Sub-pages */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><OrdersManager /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><MenuManager /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/menu/:id" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><DishEditor /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><EmployeeManager /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/employees/:id" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><EmployeeDetail /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/schedule" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><ScheduleManager /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/friday" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><FridayManager /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><ReportsPage /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/expenses" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><ExpensesManager /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><Settings /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/qr-codes" element={
            <ProtectedRoute requiredRole="admin" loginPath="/staff">
              <AdminLayout><QRCodes /></AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
```

- [ ] **Step 2: Delete removed files**

Delete: `src/pages/customer/LoyaltyJoin.tsx`, `src/pages/customer/Events.tsx`, `src/pages/customer/OrderHistory.tsx`, `src/pages/admin/EventManager.tsx`, `src/pages/admin/MembersList.tsx`, `src/pages/kitchen/KitchenLogin.tsx`, `src/pages/kitchen/KitchenBoard.tsx`, `src/components/layout/KitchenLayout.tsx`

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Fix any TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete routing redesign with customer, employee, and admin portals"
```

---

## Phase 8: Supabase Edge Functions

### Task 29: Core Edge Functions

**Files:**
- Create: `supabase/functions/validate-pin/index.ts`
- Create: `supabase/functions/submit-order/index.ts`
- Create: `supabase/functions/update-order-status/index.ts`
- Create: `supabase/functions/public-settings/index.ts`

- [ ] **Step 1: validate-pin**

Accepts `{ pin, role }`. Fetches settings row, compares PIN. Rate limits by IP (5 attempts / 10 min). Returns `{ valid: boolean }`.

- [ ] **Step 2: submit-order**

Accepts `{ table_number, items, notes, created_by }`. Validates table number against `settings.table_count`. Inserts order + order_items. Calculates total. Returns `{ order_id, total }`.

- [ ] **Step 3: update-order-status**

Accepts `{ order_id, status }`. Updates order status. Allows both forward and backward transitions.

- [ ] **Step 4: public-settings**

Returns settings row (excluding PIN hashes).

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add core edge functions (pin, order, status, settings)"
```

---

### Task 30: Employee Edge Functions

**Files:**
- Create: `supabase/functions/employee-checkin/index.ts`
- Create: `supabase/functions/employee-salary/index.ts`
- Create: `supabase/functions/manual-checkin/index.ts`

- [ ] **Step 1: employee-checkin**

Accepts `{ action: 'in' | 'out', lat, lng }`. Validates GPS distance against restaurant location. If `action === 'in'`, creates attendance record. If `action === 'out'`, updates `check_out` on most recent open record.

- [ ] **Step 2: employee-salary**

Accepts `{ employee_id }`. Calculates accumulated salary for current month from attendance records × pay rate.

- [ ] **Step 3: manual-checkin**

Admin-only. Accepts `{ employee_id, check_in, check_out }`. Creates attendance record with `is_manual: true`.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add employee edge functions (checkin, salary, manual-checkin)"
```

---

### Task 31: Admin CRUD Edge Functions

**Files:**
- Create remaining edge functions: `admin-dishes`, `admin-categories`, `admin-employees`, `admin-attendance`, `admin-schedule`, `admin-friday`, `submit-friday-booking`, `admin-bookings`, `admin-expenses`, `admin-reports`, `admin-settings`

- [ ] **Step 1: Create all admin CRUD functions**

Each function handles GET/POST/PUT/DELETE via the HTTP method, using service_role key for elevated access. All validate admin PIN from request header.

- [ ] **Step 2: Deploy edge functions**

```bash
supabase functions deploy
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add all admin CRUD edge functions"
```

---

## Phase 9: PWA + Polish + Deploy

### Task 32: Update PWA Config

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Update manifest for redesign**

Update PWA manifest `start_url` to `/#/` (table entry). Ensure icons are correct. Update `theme_color` and `background_color`.

- [ ] **Step 2: Commit**

```bash
git add vite.config.ts
git commit -m "feat: update PWA manifest for redesigned app"
```

---

### Task 33: Add date-fns Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install new dependencies**

```bash
npm install date-fns date-fns-tz
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add date-fns and date-fns-tz dependencies"
```

---

### Task 34: Final Build + Deploy

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Fix any errors.

- [ ] **Step 2: Test locally**

```bash
npm run dev
```

Test all 3 portals: customer flow, employee check-in + orders, admin home + all 8 sections.

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```

GitHub Actions deploys to GitHub Pages automatically.

- [ ] **Step 4: Verify production**

Open `https://co-projects-il.github.io/jasmine-pattaya/` and test:
- Customer: enter table → browse menu → add to cart → submit → see total "excl. service"
- Staff: click gear icon → employee login (0000) → GPS check → check-in → kanban
- Admin: gear icon → admin login (1111) → 8-button grid → all sections work

---

## Summary of Phases

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-6 | Database, types, utilities, stores, hooks, i18n |
| 2 | 7-12 | Customer portal redesign |
| 3 | 13-17 | Employee portal (new) |
| 4 | 18-23 | Admin portal redesign |
| 5 | 24-25 | Financial reports + expenses |
| 6 | 26-27 | Settings + QR codes |
| 7 | 28 | Routing + cleanup |
| 8 | 29-31 | Supabase Edge Functions |
| 9 | 32-34 | PWA, dependencies, deploy |
