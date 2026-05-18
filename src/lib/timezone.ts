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
