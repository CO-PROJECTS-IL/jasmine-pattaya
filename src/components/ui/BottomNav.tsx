import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../hooks/useSettings'

function MenuIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16M4 15h16M4 11h16M4 7h16" />
    </svg>
  )
}

function CandleIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2c0 0-2 3-2 5s1.5 3 2 3 2-1 2-3-2-5-2-5z" />
      <rect x="7" y="10" width="4" height="11" rx="1" />
      <path d="M17 5c0 0-2 3-2 5s1.5 3 2 3 2-1 2-3-2-5-2-5z" />
      <rect x="15" y="13" width="4" height="8" rx="1" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  )
}

function OrdersIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}

function ReserveIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  )
}

function LoyaltyIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function NavIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

export default function BottomNav() {
  const { t } = useTranslation()
  const { data: settings } = useSettings()

  const GOOGLE_MAPS_URL = 'https://www.google.com/maps/dir/?api=1&destination=12.926818,100.877022&destination_place_id=ChIJExample&travelmode=driving'

  const tabs = [
    { to: '/menu', label: t('nav.menu'), Icon: MenuIcon },
    { to: '/orders', label: t('orderHistory.title'), Icon: OrdersIcon },
    { to: '/reserve', label: t('nav.reserve'), Icon: ReserveIcon },
    { to: '/friday-dinner', label: t('friday.title'), Icon: CandleIcon },
  ]

  if (settings?.loyalty_enabled) {
    tabs.push({ to: '/loyalty', label: t('loyalty.navTitle'), Icon: LoyaltyIcon })
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 backdrop-blur-md"
      style={{
        backgroundColor: 'oklch(0.14 0.005 85 / 0.92)',
        borderTop: '1px solid oklch(0.75 0.12 85 / 0.12)',
      }}
    >
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="flex flex-col items-center justify-center min-w-[3rem] min-h-[3rem] py-2 px-3 text-xs transition-all duration-200"
            style={({ isActive }) => ({
              color: isActive ? 'oklch(0.75 0.12 85)' : 'oklch(0.50 0.01 85)',
            })}
            aria-label={tab.label}
          >
            {({ isActive }) => (
              <>
                <tab.Icon active={isActive} />
                <span className={`mt-1 ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center min-w-[3rem] min-h-[3rem] py-2 px-3 text-xs transition-all duration-200"
          style={{ color: 'oklch(0.50 0.01 85)' }}
          aria-label={t('nav.navigate')}
        >
          <NavIcon />
          <span className="mt-1">{t('nav.navigate')}</span>
        </a>
      </div>
    </nav>
  )
}
