import { createContext, useContext, useState } from 'react'

const TOKEN_KEY  = 'filo_token'
const ROL_KEY    = 'filo_rol'
const NAM_KEY    = 'filo_nam'
const BASE       = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function readSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  return {
    token,
    rol:     localStorage.getItem(ROL_KEY),
    adSoyad: localStorage.getItem(NAM_KEY),
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())

  const profile = session
    ? { rol: session.rol, ad_soyad: session.adSoyad }
    : null

  async function login(email, password) {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.message ?? 'Giriş başarısız.')
    }
    const { token, rol, adSoyad } = json.data
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ROL_KEY,   rol)
    localStorage.setItem(NAM_KEY,   adSoyad)
    setSession({ token, rol, adSoyad })
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROL_KEY)
    localStorage.removeItem(NAM_KEY)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading: false, login, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
