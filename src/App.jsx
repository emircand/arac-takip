import { useState } from 'react'
import NavBar from './components/NavBar'
import FieldPage from './pages/FieldPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [page, setPage] = useState('field')

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar currentPage={page} onNavigate={setPage} />
      <main>
        {page === 'field' && <FieldPage />}
        {page === 'dashboard' && <DashboardPage />}
      </main>
    </div>
  )
}
