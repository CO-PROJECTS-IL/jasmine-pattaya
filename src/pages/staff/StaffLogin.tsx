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
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--dark)' }}>
        <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
        <h1 className="text-2xl mb-2" style={{ color: 'var(--gold)' }}>
          {mode === 'admin' ? t('staff.adminLogin') : t('staff.employeeLogin')}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{t('staff.enterPin')}</p>
        <PinInput onSubmit={handleSubmit} title="" loading={loading} />
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        <button
          onClick={() => { setMode(null); setError('') }}
          className="mt-8 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6" style={{ backgroundColor: 'var(--dark)' }}>
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
      <h1 className="text-3xl mb-4" style={{ color: 'var(--gold)' }}>{t('staff.title')}</h1>
      <button
        onClick={() => setMode('admin')}
        className="w-64 py-4 rounded-xl text-lg font-medium transition-colors"
        style={{ backgroundColor: 'oklch(0.75 0.12 85 / 0.1)', border: '1px solid oklch(0.75 0.12 85 / 0.3)', color: 'var(--gold)' }}
      >
        {t('staff.adminLogin')}
      </button>
      <button
        onClick={() => setMode('employee')}
        className="w-64 py-4 bg-white/5 rounded-xl text-lg font-medium hover:bg-white/10 transition-colors"
        style={{ border: '1px solid oklch(0.30 0.005 85)', color: 'var(--text-secondary)' }}
      >
        {t('staff.employeeLogin')}
      </button>
      <button
        onClick={() => navigate('/')}
        className="mt-4 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        {t('common.back')}
      </button>
    </div>
  )
}
