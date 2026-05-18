import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Member } from '../../lib/constants'

const MOCK_MEMBERS: Member[] = [
  { id: 'm1', name: 'יוסי כהן', phone: '0501234567', email: 'yossi@email.com', joinedAt: '2026-01-15', totalSpent: 4500, visitCount: 12 },
  { id: 'm2', name: 'דנה לוי', phone: '0529876543', email: 'dana@email.com', joinedAt: '2026-02-20', totalSpent: 3200, visitCount: 8 },
  { id: 'm3', name: 'אלון ברק', phone: '0541112233', email: null, joinedAt: '2026-03-10', totalSpent: 1800, visitCount: 5 },
  { id: 'm4', name: 'מיכל אברהם', phone: '0505556677', email: 'michal@email.com', joinedAt: '2026-04-01', totalSpent: 6700, visitCount: 18 },
  { id: 'm5', name: 'John Smith', phone: '0801234567', email: 'john@email.com', joinedAt: '2026-04-15', totalSpent: 2100, visitCount: 6 },
]

export default function MembersList() {
  const { t } = useTranslation()
  const [members] = useState<Member[]>(MOCK_MEMBERS)
  const [search, setSearch] = useState('')

  const filtered = members.filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      (m.email && m.email.toLowerCase().includes(q))
    )
  })

  const totalMembers = members.length
  const totalSpent = members.reduce((sum, m) => sum + m.totalSpent, 0)

  const exportCSV = () => {
    const header = 'Name,Phone,Email,Joined,Total Spent,Visits'
    const rows = members.map(
      (m) => `${m.name},${m.phone},${m.email ?? ''},${m.joinedAt},${m.totalSpent},${m.visitCount}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'jasmine-members.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-[#c9a84c] font-bold">{t('admin.members')}</h1>
        <button
          onClick={exportCSV}
          className="bg-[#1a1a1a] text-[#c9a84c] border border-[#c9a84c]/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c9a84c]/10 transition-colors"
        >
          CSV ↓
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm mb-1">{t('admin.members')}</p>
          <p className="text-2xl font-bold text-[#c9a84c]">{totalMembers}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm mb-1">{t('dashboard.todayRevenue')}</p>
          <p className="text-2xl font-bold text-[#c9a84c]">฿{totalSpent.toLocaleString()}</p>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('common.search') + '...'}
        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#c9a84c] mb-4"
      />

      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_2fr_1fr_1fr] gap-2 px-4 py-3 border-b border-white/5 text-xs text-gray-500 uppercase">
          <span>{t('loyalty.name')}</span>
          <span>{t('loyalty.phone')}</span>
          <span>{t('loyalty.email')}</span>
          <span>{t('dashboard.todayRevenue')}</span>
          <span>ביקורים</span>
        </div>

        {filtered.map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-1 md:grid-cols-[2fr_1fr_2fr_1fr_1fr] gap-2 px-4 py-3 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-white text-sm font-medium">{member.name}</span>
            <span className="text-gray-400 text-sm hidden md:block">{member.phone}</span>
            <span className="text-gray-400 text-sm hidden md:block">{member.email ?? '—'}</span>
            <span className="text-[#c9a84c] text-sm font-medium hidden md:block">
              ฿{member.totalSpent.toLocaleString()}
            </span>
            <span className="text-gray-400 text-sm hidden md:block">{member.visitCount}</span>

            <div className="flex items-center gap-4 md:hidden text-xs text-gray-400 mt-1">
              <span>{member.phone}</span>
              <span className="text-[#c9a84c]">฿{member.totalSpent.toLocaleString()}</span>
              <span>{member.visitCount} ביקורים</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">{t('common.noResults')}</div>
        )}
      </div>
    </div>
  )
}
