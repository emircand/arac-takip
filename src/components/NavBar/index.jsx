export default function NavBar({ currentPage, onNavigate }) {
  const tabs = [
    { id: 'field', label: 'Saha Girişi', icon: '🚛' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  ]

  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <span className="font-bold text-lg tracking-tight">Filo Takip</span>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  currentPage === tab.id
                    ? 'bg-white text-blue-700'
                    : 'text-blue-100 hover:bg-blue-600'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
