import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

interface Member {
  id: string
  full_name: string
  phone: string
  email: string | null
  created_at: string
}

export default function MembersManager() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [exportMsg, setExportMsg] = useState(false)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: async (): Promise<Member[]> => {
      if (!isSupabaseConfigured) return []
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const filtered = members.filter((m) => {
    const q = search.toLowerCase()
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q)
    )
  })

  function handleExport() {
    const phones = members.map((m) => m.phone).filter(Boolean).join('\n')
    const blob = new Blob([phones], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'members-phones.csv'
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg(true)
    setTimeout(() => setExportMsg(false), 3000)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl" style={{ color: 'var(--gold)' }}>
          {t('members.title')}
        </h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--dark)' }}
        >
          {t('members.export')}
        </button>
      </div>

      {exportMsg && (
        <div
          className="mb-4 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: 'oklch(0.45 0.15 145 / 0.25)', color: 'oklch(0.75 0.15 145)' }}
        >
          {t('members.exportSuccess')}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <svg
            className="absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--text-muted)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('members.search')}
            className="w-full ps-9 pe-3 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--dark-lighter)',
              color: 'var(--text-primary)',
              border: '1px solid oklch(0.25 0.008 60)',
            }}
          />
        </div>
        <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
          {t('members.total')}: <strong style={{ color: 'var(--gold)' }}>{members.length}</strong>
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          {t('members.noMembers')}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.25 0.008 60)' }}>
          {/* Header */}
          <div
            className="grid grid-cols-4 px-4 py-2 text-xs font-medium"
            style={{ backgroundColor: 'oklch(0.75 0.14 60 / 0.1)', color: 'var(--text-muted)' }}
          >
            <span>{t('members.name')}</span>
            <span>{t('members.phone')}</span>
            <span className="hidden sm:block">{t('members.email')}</span>
            <span className="text-end">{t('members.joinDate')}</span>
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ borderColor: 'oklch(0.25 0.008 60)' }}>
            {filtered.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-4 px-4 py-3 items-center text-sm"
                style={{ backgroundColor: 'var(--dark-light)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: 'oklch(0.75 0.14 60 / 0.2)', color: 'var(--gold)' }}
                  >
                    {member.full_name.charAt(0)}
                  </div>
                  <span className="truncate" style={{ color: 'var(--text-primary)' }}>
                    {member.full_name}
                  </span>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>{member.phone}</span>
                <span className="hidden sm:block truncate" style={{ color: 'var(--text-muted)' }}>
                  {member.email ?? '—'}
                </span>
                <span className="text-end text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(member.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
