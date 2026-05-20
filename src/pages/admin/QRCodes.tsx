import { useTranslation } from 'react-i18next'
import { useSettings } from '../../hooks/useSettings'

function getBaseUrl() {
  const loc = window.location
  return `${loc.origin}${loc.pathname}`
}

function qrImageUrl(data: string, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=080808&color=6b8aed&format=svg`
}

export default function QRCodes() {
  const { t } = useTranslation()
  const { data: settings } = useSettings()
  const tableCount = settings?.table_count || 30
  const base = getBaseUrl()
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1)

  const handlePrint = () => window.print()

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>QR Codes</h1>
        <button
          onClick={handlePrint}
          className="px-6 py-2 rounded-lg font-bold text-sm transition-colors"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          {t('common.save')} / Print
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-3 print:gap-6">
        {tables.map((num) => {
          const url = `${base}#/?table=${num}`
          return (
            <div
              key={num}
              className="rounded-xl p-4 flex flex-col items-center gap-2 print:border print:border-gray-300 print:bg-white print:rounded-lg"
              style={{ backgroundColor: 'var(--dark-lighter)', border: '1px solid oklch(0.25 0.008 255)' }}
            >
              <img
                src={qrImageUrl(url)}
                alt={`Table ${num}`}
                width={160}
                height={160}
                className="rounded-lg print:w-40 print:h-40"
                loading="lazy"
              />
              <div className="text-center">
                <p className="font-bold text-lg print:text-black" style={{ color: 'var(--accent)' }}>
                  {t('cart.table')} {num}
                </p>
                <p className="text-[10px] font-mono break-all print:text-gray-600" style={{ color: 'var(--text-muted)' }}>
                  {url}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
