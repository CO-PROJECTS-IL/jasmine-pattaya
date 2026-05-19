import { useLanguage } from '../../hooks/useLanguage'

const LANGUAGES = [
  { code: 'he', label: 'עב' },
  { code: 'en', label: 'EN' },
  { code: 'th', label: 'ไทย' },
]

export default function LanguageSwitcher() {
  const { currentLang, setLanguage } = useLanguage()

  return (
    <div className="flex gap-1">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
          style={
            currentLang === lang.code
              ? {
                  backgroundColor: 'var(--gold)',
                  color: 'oklch(0.15 0.01 85)',
                }
              : {
                  backgroundColor: 'oklch(0.20 0.005 85)',
                  color: 'oklch(0.55 0.01 85)',
                }
          }
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
