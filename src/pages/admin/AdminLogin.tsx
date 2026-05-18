import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PinInput from '../../components/ui/PinInput'
import { useAuthStore } from '../../stores/authStore'

export default function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const validatePin = useAuthStore((s) => s.validatePin)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (pin: string) => {
    setLoading(true)
    setError('')
    const valid = await validatePin(pin, 'admin')
    setLoading(false)
    if (valid) {
      navigate('/admin/dashboard')
    } else {
      setError('קוד שגוי')
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4">
      <PinInput onSubmit={handleSubmit} title={t('admin.enterPin')} loading={loading} />
      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
    </div>
  )
}
