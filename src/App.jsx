import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import LoginPage from './pages/LoginPage'
import FieldPage from './pages/FieldPage'
import DashboardPage from './pages/DashboardPage'
import TanimlarPage from './pages/TanimlarPage'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="pb-20 sm:pb-0">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/saha"
            element={
              <ProtectedRoute>
                <Layout><FieldPage /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tanimlar"
            element={
              <ProtectedRoute>
                <Layout><TanimlarPage /></Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="yonetici">
                <Layout><DashboardPage /></Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/saha" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
