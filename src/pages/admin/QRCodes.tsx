import { useTranslation } from 'react-i18next'
import { useSettings } from '../../hooks/useSettings'

function getBaseUrl() {
  const loc = window.location
  return `${loc.origin}${loc.pathname}`
}

function qrImageUrl(data: string, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=080808&color=c9a84c&format=svg`
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
        <h1 className="text-2xl text-[#c9a84c] font-bold">QR Codes</h1>
        <button
          onClick={handlePrint}
          className="bg-[#c9a84c] text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#d4b96a] transition-colors"
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
              className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 flex flex-col items-center gap-2 print:border print:border-gray-300 print:bg-white print:rounded-lg"
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
                <p className="text-[#c9a84c] font-bold text-lg print:text-black">
                  {t('cart.table')} {num}
                </p>
                <p className="text-gray-500 text-[10px] font-mono break-all print:text-gray-600">
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
