/**
 * AuthContext — geriye dönük uyumlu shim.
 * Tüm state Zustand authStore üzerinde yaşar.
 * Mevcut useAuth() çağrıları değiştirilmeden çalışmaya devam eder.
 */
import { createContext, useContext } from 'react'
import { useAuthStore } from '../store/authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const { session, login, signOut } = useAuthStore()
  const profile = session ? { rol: session.rol, ad_soyad: session.adSoyad } : null
  return { session, profile, loading: false, login, signOut }
}
