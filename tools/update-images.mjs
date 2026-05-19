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

// Build a map: name_he -> first image_url found (skip empty)
const imageMap = new Map()
for (const dish of raw.dishes) {
  if (dish.image_url && !imageMap.has(dish.name_he)) {
    imageMap.set(dish.name_he, dish.image_url)
  }
}

console.log(`Found ${imageMap.size} dishes with images in menu-raw.json`)

// Fetch all dishes from Supabase
const { data: dishes, error } = await supabase.from('dishes').select('id, name_he, image_url')
if (error) { console.error('Fetch error:', error); process.exit(1) }

console.log(`Found ${dishes.length} dishes in Supabase`)

let updated = 0
let skipped = 0
let notFound = 0

for (const dish of dishes) {
  const imageUrl = imageMap.get(dish.name_he)
  if (!imageUrl) {
    console.log(`  No image found for: ${dish.name_he}`)
    notFound++
    continue
  }
  if (dish.image_url === imageUrl) {
    skipped++
    continue
  }

  const { error: updateError } = await supabase
    .from('dishes')
    .update({ image_url: imageUrl })
    .eq('id', dish.id)

  if (updateError) {
    console.error(`  Error updating ${dish.name_he}:`, updateError)
  } else {
    console.log(`  ✓ Updated: ${dish.name_he}`)
    updated++
  }
}

console.log(`\nDone! Updated: ${updated}, Skipped (already set): ${skipped}, No image: ${notFound}`)
