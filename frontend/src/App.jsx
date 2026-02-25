import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import LoginPage from './pages/LoginPage'

const FieldPage     = lazy(() => import('./pages/FieldPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TanimlarPage  = lazy(() => import('./pages/TanimlarPage'))
const YakitPage     = lazy(() => import('./pages/YakitPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30s önbellek
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/saha"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageSpinner />}><FieldPage /></Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tanimlar"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageSpinner />}><TanimlarPage /></Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="yonetici">
                  <Layout>
                    <Suspense fallback={<PageSpinner />}><DashboardPage /></Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/yakit"
              element={
                <ProtectedRoute requiredRole="yonetici">
                  <Layout>
                    <Suspense fallback={<PageSpinner />}><YakitPage /></Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/saha" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
