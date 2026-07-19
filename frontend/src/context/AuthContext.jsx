import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const connexion = useCallback(async (email, motDePasse) => {
    const { data } = await api.post('/auth/login', {
      username: email,
      password: motDePasse,
    })
    localStorage.setItem('token', data.token)

    const profil = { email, roles: data.roles ?? [] }
    localStorage.setItem('user', JSON.stringify(profil))
    setUser(profil)
  }, [])

  const inscription = useCallback(async (email, motDePasse, role) => {
    await api.post('/auth/register', { email, password: motDePasse, role })
  }, [])

  const deconnexion = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const estConnecte = Boolean(user)
  const aRole = (role) => user?.roles?.includes(role) ?? false

  return (
    <AuthContext.Provider value={{ user, estConnecte, aRole, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
