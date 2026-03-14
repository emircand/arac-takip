import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function NavBar() {
  const { profile, signOut } = useAuth()
  const isYonetici = profile?.rol === 'yonetici'

  const navItems = [
    { to: '/saha',     label: 'Saha',     icon: '🚛' },
    { to: '/arizalar', label: 'Arızalar', icon: '🔧' },
    ...(isYonetici ? [
      { to: '/tanimlar',  label: 'Tanımlar',  icon: '📋' },
      { to: '/stok',      label: 'Stok',      icon: '📦' },
      { to: '/yakit',          label: 'Yakıt',       icon: '⛽' },
      { to: '/yakit-analitik', label: 'Analitik',    icon: '📈' },
      { to: '/dashboard',      label: 'Dashboard',   icon: '📊' },
    ] : []),
  ]

  const desktopLink = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    }`

  const mobileLink = ({ isActive }) =>
    `flex-1 flex flex-col items-center gap-0.5 pt-2 pb-3 transition-colors relative ${
      isActive ? 'text-blue-600' : 'text-gray-400'
    }`

  return (
    <>
      {/* ── Desktop top nav ────────────────────────────────── */}
      <header className="hidden sm:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-blue-700 flex items-center gap-1.5">
              🚛 <span>Filo Takip</span>
            </span>
            <nav className="flex gap-0.5">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={desktopLink}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {profile?.ad_soyad && (
              <span className="text-sm text-gray-600">{profile.ad_soyad}</span>
            )}
            {isYonetici && (
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                Yönetici
              </span>
            )}
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors ml-1"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobil üst çubuk ────────────────────────────────── */}
      <header className="sm:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 h-12 flex items-center justify-between">
          <span className="font-bold text-blue-700 text-sm">🚛 Filo Takip</span>
          <div className="flex items-center gap-2">
            {profile?.ad_soyad && (
              <span className="text-xs text-gray-500 font-medium">{profile.ad_soyad}</span>
            )}
            {isYonetici && (
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                YÖN
              </span>
            )}
            <button
              onClick={signOut}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobil alt nav ──────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={mobileLink}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                )}
                <span className="text-[22px] leading-none">{item.icon}</span>
                <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
