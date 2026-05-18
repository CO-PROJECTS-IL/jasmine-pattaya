import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../stores/cartStore'
import { TABLE_MIN, TABLE_MAX } from '../../lib/constants'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'

export default function TableEntry() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const setTable = useCartStore((s) => s.setTable)
  const [tableInput, setTableInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.hash.replace('#/', '').split('?')[1] || '')
    const tableParam = params.get('table')
    if (tableParam) {
      const num = parseInt(tableParam, 10)
      if (num >= TABLE_MIN && num <= TABLE_MAX) {
        setTable(num)
        navigate('/menu')
      }
    }
  }, [location.hash, navigate, setTable])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(tableInput, 10)
    if (isNaN(num) || num < TABLE_MIN || num > TABLE_MAX) {
      setError(t('table.invalid'))
      return
    }
    setTable(num)
    navigate('/menu')
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 end-4">
        <LanguageSwitcher />
      </div>

      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-5xl md:text-6xl text-[#c9a84c] mb-3">{t('table.title')}</h1>
        <p className="text-gray-400 text-lg">{t('table.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4 animate-slide-up">
        <label className="text-sm text-gray-400 text-center">{t('table.enterTable')}</label>
        <input
          type="number"
          inputMode="numeric"
          min={TABLE_MIN}
          max={TABLE_MAX}
          value={tableInput}
          onChange={(e) => {
            setTableInput(e.target.value)
            setError('')
          }}
          placeholder={t('table.placeholder')}
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#c9a84c]/30 rounded-xl text-center text-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a84c] transition-colors"
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 bg-[#c9a84c] text-[#080808] rounded-xl text-lg font-semibold hover:bg-[#d4b96a] active:bg-[#a88a3a] transition-colors"
        >
          {t('table.submit')}
        </button>
      </form>
    </div>
  )
}
