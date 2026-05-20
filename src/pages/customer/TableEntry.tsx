import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../stores/cartStore'
import { useSettings } from '../../hooks/useSettings'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'
import InstallPrompt from '../../components/ui/InstallPrompt'

export default function TableEntry() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const setTable = useCartStore((s) => s.setTable)
  const [tableInput, setTableInput] = useState('')
  const [error, setError] = useState('')
  const { data: settings } = useSettings()

  const tableMin = 1
  const tableMax = settings?.table_count || 30

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tableParam = params.get('table')
    if (tableParam) {
      const num = parseInt(tableParam, 10)
      if (num >= tableMin && num <= tableMax) {
        setTable(num)
        navigate('/menu')
      }
    }
  }, [location.search, navigate, setTable, tableMin, tableMax])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(tableInput, 10)
    if (isNaN(num) || num < tableMin || num > tableMax) {
      setError(t('table.invalid'))
      return
    }
    setTable(num)
    navigate('/menu')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: 'oklch(0.97 0.002 255)' }}
    >
      <InstallPrompt />

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://cdn.pixabay.com/photo/2016/07/29/14/44/pattaya-1553390_1280.jpg)',
          filter: 'brightness(0.92) saturate(0.4)',
          opacity: 0.15,
        }}
      />

      <div className="absolute top-5 end-5 z-10">
        <LanguageSwitcher />
      </div>

      <div className="text-center mb-14 animate-fade-in relative z-10">
        <div className="mb-6 flex justify-center">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Jasmine Restaurant"
            className="w-48 h-48 md:w-56 md:h-56 drop-shadow-2xl"
          />
        </div>

        <p className="text-lg md:text-xl font-light" style={{ color: 'var(--text-secondary)' }}>
          {t('table.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-5 animate-slide-up relative z-10">
        <label htmlFor="input-table-number" className="text-sm text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
          {t('table.enterTable')}
        </label>
        <input
          id="input-table-number"
          type="number"
          inputMode="numeric"
          min={tableMin}
          max={tableMax}
          value={tableInput}
          onChange={(e) => {
            setTableInput(e.target.value)
            setError('')
          }}
          placeholder={t('table.placeholder')}
          className="w-full px-5 py-4 rounded-2xl text-center text-2xl font-semibold transition-all duration-300"
          style={{
            backgroundColor: 'white',
            border: '1.5px solid oklch(0.92 0.005 255)',
            color: 'var(--text-primary)',
            boxShadow: '0 2px 8px oklch(0.20 0.02 60 / 0.04)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.target.style.borderColor = 'oklch(0.92 0.005 255)'}
        />
        {error && <p className="text-sm text-center" style={{ color: 'oklch(0.55 0.18 25)' }}>{error}</p>}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl text-lg font-bold tracking-wide transition-all duration-200 active:scale-[0.98]"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
          }}
        >
          {t('table.submit')}
        </button>
      </form>

      <button
        onClick={() => navigate('/staff')}
        className="fixed bottom-4 right-4 p-2 transition-colors"
        style={{ color: 'oklch(0.20 0.02 60 / 0.15)' }}
        aria-label="Staff"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>
    </div>
  )
}
