import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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

  const GOOGLE_MAPS_URL = 'https://www.google.com/maps/dir/?api=1&destination=12.926818,100.877022&destination_place_id=ChIJExample&travelmode=driving'

  const tabs = [
    { to: '/menu', label: t('nav.menu'), Icon: MenuIcon },
    { to: '/reserve', label: t('nav.reserve'), Icon: ReserveIcon },
    { to: '/friday-dinner', label: t('friday.title'), Icon: CandleIcon },
  ]

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
            className="flex flex-col items-center py-3 px-4 text-xs transition-all duration-200"
            style={({ isActive }) => ({
              color: isActive ? 'oklch(0.75 0.12 85)' : 'oklch(0.50 0.01 85)',
            })}
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
          className="flex flex-col items-center py-3 px-4 text-xs transition-all duration-200"
          style={{ color: 'oklch(0.50 0.01 85)' }}
        >
          <NavIcon />
          <span className="mt-1">{t('nav.navigate')}</span>
        </a>
      </div>
    </nav>
  )
}
