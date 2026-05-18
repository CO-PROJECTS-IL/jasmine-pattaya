import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'

const RTL_LANGUAGES = ['he']

export function useLanguage() {
  const { i18n } = useTranslation()

  const currentLang = i18n.language

  const setLanguage = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang)
      localStorage.setItem('lang', lang)
      document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr'
      document.documentElement.lang = lang
    },
    [i18n]
  )

  return { currentLang, setLanguage }
}
