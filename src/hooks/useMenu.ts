import { useMemo } from 'react'
import menuRaw from '../data/menu-raw.json'
import type { Category, Dish } from '../lib/constants'

interface RawDish {
  category: string
  category_slug: string
  name_he: string
  name_en: string
  name_th?: string
  price: number
  description_he: string
  description_en: string
  image_url: string
  image_file: string
  is_kosher?: boolean
}

interface RawCategory {
  id: string
  name_he: string
  name_en: string
  name_th: string
  slug: string
}

export function useMenu() {
  const { categories, dishes } = useMemo(() => {
    const raw = menuRaw as {
      categories: RawCategory[]
      dishes: RawDish[]
    }

    const cats: Category[] = raw.categories.map((c, i) => ({
      id: c.id,
      slug: c.slug as Category['slug'],
      nameHe: c.name_he,
      nameEn: c.name_en,
      nameTh: c.name_th,
      sortOrder: i,
    }))

    const items: Dish[] = raw.dishes.map((d, i) => {
      const cat = raw.categories.find((c) => c.slug === d.category_slug)
      return {
        id: `dish-${i}`,
        categoryId: cat?.id ?? '',
        nameHe: d.name_he,
        nameEn: d.name_en,
        nameTh: d.name_th ?? d.name_en,
        descriptionHe: d.description_he,
        descriptionEn: d.description_en,
        descriptionTh: '',
        price: d.price,
        imageUrl: d.image_url || null,
        available: true,
        kosher: d.is_kosher ?? false,
        spicy: false,
        vegetarian: false,
        sortOrder: i,
      }
    })

    return { categories: cats, dishes: items }
  }, [])

  const getDishesByCategory = (categoryId: string) =>
    dishes.filter((d) => d.categoryId === categoryId)

  return { categories, dishes, getDishesByCategory, isLoading: false }
}
