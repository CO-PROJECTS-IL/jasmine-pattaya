-- Special Menus: generalizes the Friday-only menu into a flexible scheduling system
-- Supports recurring (every Friday, every Saturday, etc.) and specific-date menus

CREATE TABLE special_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  name_th TEXT NOT NULL DEFAULT '',
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('recurring', 'specific_date')),
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  specific_date DATE,
  switch_time TIME NOT NULL DEFAULT '14:00',
  max_guests INT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE special_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  special_menu_id UUID NOT NULL REFERENCES special_menus(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  override_price NUMERIC(10,2),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(special_menu_id, dish_id)
);

CREATE TABLE special_menu_cancelled_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  special_menu_id UUID NOT NULL REFERENCES special_menus(id) ON DELETE CASCADE,
  cancelled_date DATE NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(special_menu_id, cancelled_date)
);

-- Migrate existing Friday menu data into the new system
INSERT INTO special_menus (name_he, name_en, schedule_type, day_of_week, switch_time, max_guests, is_enabled)
SELECT
  'ארוחת שישי',
  'Friday Dinner',
  'recurring',
  5,
  COALESCE(s.friday_switch_time, '14:00'),
  s.friday_max_guests,
  COALESCE(s.friday_enabled, true)
FROM settings s WHERE s.id = 1;

INSERT INTO special_menu_items (special_menu_id, dish_id, override_price, sort_order, is_active)
SELECT sm.id, fm.dish_id, fm.friday_price, fm.sort_order, fm.is_active
FROM friday_menu fm
CROSS JOIN special_menus sm
WHERE sm.schedule_type = 'recurring' AND sm.day_of_week = 5;

INSERT INTO special_menu_cancelled_dates (special_menu_id, cancelled_date, reason)
SELECT sm.id, fcd.friday_date, fcd.reason
FROM friday_cancelled_dates fcd
CROSS JOIN special_menus sm
WHERE sm.schedule_type = 'recurring' AND sm.day_of_week = 5;

-- RLS
ALTER TABLE special_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_menu_cancelled_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read special_menus" ON special_menus FOR SELECT USING (true);
CREATE POLICY "Anyone can read special_menu_items" ON special_menu_items FOR SELECT USING (true);
CREATE POLICY "Anyone can read special_menu_cancelled_dates" ON special_menu_cancelled_dates FOR SELECT USING (true);

-- Auto-update trigger
CREATE TRIGGER special_menus_updated_at BEFORE UPDATE ON special_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
