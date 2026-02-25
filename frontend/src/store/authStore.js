import { create } from 'zustand'

const TOKEN_KEY = 'filo_token'
const ROL_KEY   = 'filo_rol'
const NAM_KEY   = 'filo_nam'
const BASE      = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function readSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  return { token, rol: localStorage.getItem(ROL_KEY), adSoyad: localStorage.getItem(NAM_KEY) }
}

export const useAuthStore = create((set) => ({
  session: readSession(),

  get profile() {
    const s = useAuthStore.getState().session
    return s ? { rol: s.rol, ad_soyad: s.adSoyad } : null
  },

  async login(email, password) {
    const res  = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.message ?? 'Giriş başarısız.')
    const { token, rol, adSoyad } = json.data
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ROL_KEY,   rol)
    localStorage.setItem(NAM_KEY,   adSoyad)
    set({ session: { token, rol, adSoyad } })
  },

  signOut() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROL_KEY)
    localStorage.removeItem(NAM_KEY)
    set({ session: null })
  },
}))
