import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function LoyaltyJoin() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [existing, setExisting] = useState(false)
  const [lookupPhone, setLookupPhone] = useState('')

  const handleJoin = () => {
    if (!name.trim() || !phone.trim()) return
    setSubmitted(true)
  }

  const handleLookup = () => {
    if (!lookupPhone.trim()) return
    setExisting(true)
  }

  if (submitted) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-[#c9a84c]/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="text-2xl text-[#c9a84c] font-bold mb-2">{t('loyalty.welcome')}</h2>
        <p className="text-gray-400 mb-1">{name}</p>
        <p className="text-gray-500 text-sm">{phone}</p>
        <div className="mt-6 bg-[#1a1a1a] rounded-xl p-4 border border-[#c9a84c]/20">
          <p className="text-sm text-gray-400">{t('loyalty.discount')}</p>
          <p className="text-2xl text-[#c9a84c] font-bold">10%</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl text-[#c9a84c] font-bold mb-2">{t('loyalty.title')}</h1>
      <p className="text-gray-400 text-sm mb-6">{t('loyalty.discount')} — 10%</p>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 mb-6">
        <h2 className="text-lg text-white font-bold mb-4">{t('loyalty.joinClub')}</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('loyalty.name')} *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('loyalty.phone')} *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t('loyalty.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="w-full bg-[#121212] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c]"
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={!name.trim() || !phone.trim()}
            className="w-full bg-[#c9a84c] text-black py-3 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('loyalty.submit')}
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4">
        <h2 className="text-sm text-gray-400 mb-3">{t('loyalty.alreadyMember')}</h2>
        <div className="flex gap-2">
          <input
            type="tel"
            value={lookupPhone}
            onChange={(e) => setLookupPhone(e.target.value)}
            placeholder={t('history.phonePlaceholder')}
            dir="ltr"
            className="flex-1 bg-[#121212] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
          />
          <button
            onClick={handleLookup}
            className="bg-[#1a1a1a] border border-[#c9a84c]/30 text-[#c9a84c] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#c9a84c]/10 transition-colors"
          >
            {t('common.search')}
          </button>
        </div>
        {existing && (
          <div className="mt-3 p-3 bg-[#c9a84c]/10 rounded-lg border border-[#c9a84c]/20">
            <p className="text-[#c9a84c] text-sm font-medium">{t('loyalty.welcome')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('loyalty.discount')}: 10%</p>
          </div>
        )}
      </div>
    </div>
  )
}
