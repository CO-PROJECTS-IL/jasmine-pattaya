import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../stores/authStore'
import PinInput from '../../components/ui/PinInput'

export default function KitchenLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const validatePin = useAuthStore((s) => s.validatePin)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePin = async (pin: string) => {
    setLoading(true)
    setError('')
    const valid = await validatePin(pin, 'employee')
    setLoading(false)
    if (valid) {
      navigate('/kitchen/board')
    } else {
      setError(t('staff.invalidPin'))
      setTimeout(() => setError(''), 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--dark)' }}>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)' }}>{t('kitchen.title')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{t('staff.enterPin')}</p>
      <PinInput onSubmit={handlePin} title="" loading={loading} />
      {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      <button
        onClick={() => navigate('/staff')}
        className="mt-8 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        {t('common.back')}
      </button>
    </div>
  )
}
