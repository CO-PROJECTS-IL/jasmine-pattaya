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
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: 'oklch(0.97 0.002 255)' }}
      >
        <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {mode === 'admin' ? t('staff.adminLogin') : t('staff.employeeLogin')}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>{t('staff.enterPin')}</p>
        <PinInput onSubmit={handleSubmit} title="" loading={loading} />
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        <button
          onClick={() => { setMode(null); setError('') }}
          className="mt-8 text-sm transition-colors hover:text-[var(--text-primary)]"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('common.back')}
        </button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 gap-4"
      style={{ backgroundColor: 'oklch(0.97 0.002 255)' }}
    >
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>

      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        {t('staff.title')}
      </h1>

      {/* Admin button — accent filled */}
      <button
        onClick={() => setMode('admin')}
        className="w-64 py-4 rounded-xl text-lg font-semibold transition-all"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'white',
          boxShadow: '0 2px 8px oklch(0.55 0.14 255 / 0.25)',
        }}
      >
        {t('staff.adminLogin')}
      </button>

      {/* Employee button — white with light border */}
      <button
        onClick={() => setMode('employee')}
        className="w-64 py-4 rounded-xl text-lg font-medium transition-all hover:bg-black/[0.02]"
        style={{
          backgroundColor: 'white',
          border: '1px solid oklch(0.92 0.005 255)',
          color: 'var(--text-secondary)',
          boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)',
        }}
      >
        {t('staff.employeeLogin')}
      </button>

      {/* Kitchen button — white with light border */}
      <button
        onClick={() => navigate('/kitchen')}
        className="w-64 py-4 rounded-xl text-lg font-medium transition-all hover:bg-black/[0.02]"
        style={{
          backgroundColor: 'white',
          border: '1px solid oklch(0.92 0.005 255)',
          color: 'var(--text-secondary)',
          boxShadow: '0 1px 4px oklch(0.20 0.02 60 / 0.06)',
        }}
      >
        {t('kitchen.title')}
      </button>

      <button
        onClick={() => navigate('/')}
        className="mt-4 text-sm transition-colors hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-muted)' }}
      >
        {t('common.back')}
      </button>
    </div>
  )
}
