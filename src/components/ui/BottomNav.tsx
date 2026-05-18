import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()

  const tabs = [
    { to: '/menu', label: t('nav.menu'), icon: '🍽️' },
    { to: '/friday-dinner', label: t('friday.title'), icon: '🕯️' },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#121212] border-t border-[#c9a84c]/20">
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2.5 px-6 text-xs transition-colors ${
                isActive ? 'text-[#c9a84c]' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <span className="text-lg mb-0.5">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
