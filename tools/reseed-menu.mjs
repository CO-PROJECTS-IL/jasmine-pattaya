import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabase = createClient(
  'https://uvidgodkpgipzynpyrvc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2aWRnb2RrcGdpcHp5bnB5cnZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEzMTMyNCwiZXhwIjoyMDk0NzA3MzI0fQ.Y4ST0EPi6MCM5Pl71DXeWGdv41Pd2IKH1i6ESj3pWks'
)

const raw = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'data', 'menu-raw.json'), 'utf-8'))

async function main() {
  // 1. Delete existing order_items, orders, then dishes (foreign key order)
  console.log('Clearing existing data...')

  const { error: oiErr } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (oiErr) console.log('  order_items:', oiErr.message)
  else console.log('  ✓ Cleared order_items')

  const { error: oErr } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (oErr) console.log('  orders:', oErr.message)
  else console.log('  ✓ Cleared orders')

  const { error: dErr } = await supabase.from('dishes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (dErr) console.log('  dishes:', dErr.message)
  else console.log('  ✓ Cleared dishes')

  const { error: cErr } = await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (cErr) console.log('  categories:', cErr.message)
  else console.log('  ✓ Cleared categories')

  // 2. Insert categories from menu-raw.json
  console.log('\nInserting categories...')
  const categoryMap = new Map() // slug -> id

  for (let i = 0; i < raw.categories.length; i++) {
    const cat = raw.categories[i]
    const { data, error } = await supabase.from('categories').insert({
      name_he: cat.name_he,
      name_en: cat.name_en,
      name_th: cat.name_th || '',
      sort_order: i,
    }).select('id').single()

    if (error) {
      console.error(`  Error inserting category ${cat.name_he}:`, error.message)
    } else {
      categoryMap.set(cat.slug, data.id)
      console.log(`  ✓ ${cat.name_he} (${cat.name_en})`)
    }
  }

  // 3. Insert dishes - deduplicate by name_he within same category
  console.log('\nInserting dishes...')
  const seen = new Set()
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < raw.dishes.length; i++) {
    const dish = raw.dishes[i]
    const key = `${dish.category_slug}:${dish.name_he}`

    if (seen.has(key)) {
      skipped++
      continue
    }
    seen.add(key)

    const categoryId = categoryMap.get(dish.category_slug)
    if (!categoryId) {
      console.log(`  ⚠ No category for: ${dish.name_he} (${dish.category_slug})`)
      skipped++
      continue
    }

    const { error } = await supabase.from('dishes').insert({
      category_id: categoryId,
      name_he: dish.name_he,
      name_en: dish.name_en,
      name_th: dish.name_th || '',
      description_he: dish.description_he || '',
      description_en: dish.description_en || '',
      price: dish.price,
      image_url: dish.image_url || null,
      is_kosher: dish.is_kosher || false,
      is_available: true,
      sort_order: i,
    })

    if (error) {
      console.error(`  Error: ${dish.name_he}:`, error.message)
    } else {
      inserted++
    }
  }

  console.log(`\nDone! Inserted ${inserted} dishes, skipped ${skipped}`)
  console.log(`Categories: ${categoryMap.size}`)
}

main().catch(console.error)
