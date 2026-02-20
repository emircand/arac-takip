import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

// requiredRole: 'yonetici' | undefined (undefined = any authenticated user)
export default function ProtectedRoute({ children, requiredRole }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-400 text-sm">Yükleniyor...</span>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && profile?.rol !== requiredRole) {
    return <Navigate to="/saha" replace />
  }

  return children
}
