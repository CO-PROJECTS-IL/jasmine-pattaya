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
