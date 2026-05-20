import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export default function LoyaltyClub() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [joined, setJoined] = useState(false)
  const [alreadyMember, setAlreadyMember] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name || !phone || submitting) return
    setSubmitting(true)
    setError('')
    setAlreadyMember(false)
    try {
      if (!isSupabaseConfigured) throw new Error('Not configured')
      // Check if already a member
      const { data: existing } = await supabase
        .from('members')
        .select('id')
        .eq('phone', phone)
        .maybeSingle()
      if (existing) {
        setAlreadyMember(true)
        setSubmitting(false)
        return
      }
      const { error: insertError } = await supabase
        .from('members')
        .insert({ full_name: name, phone, email: email || null })
      if (insertError) throw insertError
      setJoined(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    }
    setSubmitting(false)
  }

  if (joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-slide-up">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: 'oklch(0.55 0.14 150 / 0.1)' }}
        >
          <span className="text-4xl" style={{ color: 'oklch(0.55 0.14 150)' }}>✓</span>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
          {t('loyalty.welcomeTitle')}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('loyalty.welcomeMsg')}</p>
      </div>
    )
  }

  const inputStyle = {
    backgroundColor: 'white',
    border: '1.5px solid oklch(0.92 0.005 255)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--accent)' }}>
        {t('loyalty.title')}
      </h1>
      <p className="text-center mb-8" style={{ color: 'var(--text-muted)' }}>
        {t('loyalty.subtitle')}
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('loyalty.name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={inputStyle}
            placeholder={t('loyalty.namePlaceholder')}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('loyalty.phone')}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={inputStyle}
            placeholder="0XX-XXX-XXXX"
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>{t('loyalty.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={inputStyle}
            placeholder={t('loyalty.emailPlaceholder')}
          />
        </div>

        {alreadyMember && (
          <p className="text-sm text-center" style={{ color: 'var(--accent)' }}>{t('loyalty.alreadyMember')}</p>
        )}
        {error && (
          <p className="text-sm text-center" style={{ color: 'oklch(0.55 0.18 25)' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !name || !phone}
          className="w-full py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          {submitting ? t('common.loading') : t('loyalty.join')}
        </button>
      </div>
    </div>
  )
}
