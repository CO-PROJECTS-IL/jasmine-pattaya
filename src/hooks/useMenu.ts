import { useMemo } from 'react'
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

  const nonEmptyCategories = useMemo(() => {
    if (!dishes.length) return categories
    const categoryIdsWithDishes = new Set(dishes.map((d) => d.category_id))
    return categories.filter((c) => categoryIdsWithDishes.has(c.id))
  }, [categories, dishes])

  return { categories: nonEmptyCategories, dishes, getDishesByCategory, isLoading: catsLoading || dishesLoading }
}
