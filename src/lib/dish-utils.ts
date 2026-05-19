import type { Dish } from './types'

export function getDishName(dish: Dish, lang: string) {
  if (lang === 'he') return dish.name_he
  if (lang === 'th') return dish.name_th
  return dish.name_en
}

export function getDishDescription(dish: Dish, lang: string) {
  if (lang === 'he') return dish.description_he
  return dish.description_en
}
