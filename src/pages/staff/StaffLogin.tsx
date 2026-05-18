import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import PinInput from '../../components/ui/PinInput'
import LanguageSwitcher from '../../components/ui/LanguageSwitcher'

type LoginMode = null | 'admin' | 'employee'

export default function StaffLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const validatePin = useAuthStore((s) => s.validatePin)
  const [mode, setMode] = useState<LoginMode>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(pin: string) {
    if (!mode) return
    setLoading(true)
    setError('')
    const valid = await validatePin(pin, mode)
    setLoading(false)
    if (valid) {
      navigate(mode === 'admin' ? '/admin' : '/employee')
    } else {
      setError(t('staff.invalidPin'))
    }
  }

  if (mode) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
        <h1 className="text-2xl text-[#c9a84c] mb-2">
          {mode === 'admin' ? t('staff.adminLogin') : t('staff.employeeLogin')}
        </h1>
        <p className="text-gray-400 text-sm mb-8">{t('staff.enterPin')}</p>
        <PinInput length={4} onComplete={handleSubmit} disabled={loading} />
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        <button
          onClick={() => { setMode(null); setError('') }}
          className="mt-8 text-gray-500 text-sm hover:text-gray-300"
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-4 gap-6">
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
      <h1 className="text-3xl text-[#c9a84c] mb-4">{t('staff.title')}</h1>
      <button
        onClick={() => setMode('admin')}
        className="w-64 py-4 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl text-[#c9a84c] text-lg font-medium hover:bg-[#c9a84c]/20 transition-colors"
      >
        {t('staff.adminLogin')}
      </button>
      <button
        onClick={() => setMode('employee')}
        className="w-64 py-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-lg font-medium hover:bg-white/10 transition-colors"
      >
        {t('staff.employeeLogin')}
      </button>
      <button
        onClick={() => navigate('/')}
        className="mt-4 text-gray-500 text-sm hover:text-gray-300"
      >
        {t('common.back')}
      </button>
    </div>
  )
}
