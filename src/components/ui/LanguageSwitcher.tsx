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
          className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
            currentLang === lang.code
              ? 'bg-[#c9a84c] text-[#080808]'
              : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
