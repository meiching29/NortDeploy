import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/roble'
import { saveTokens, getAccessToken, getRefreshToken, clearTokens } from '../utils/token'

const AuthContext = createContext(null)

function buildUser(robleUser, name) {
  return {
    _id:   robleUser.sub,
    email: robleUser.email,
    role:  robleUser.role,
    name:  name || localStorage.getItem('nd_name') || robleUser.email?.split('@')[0],
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      authAPI.verifyToken(token)
        .then(res => {
          setUser(buildUser(res.data.user || res.data))
        })
        .catch(() => clearTokens())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login(email, password)
    saveTokens(res.data.accessToken, res.data.refreshToken)

    // Guardar nombre si Roble lo devuelve en el login
    const nameFromLogin = res.data.user?.name || res.data.name
    if (nameFromLogin) localStorage.setItem('nd_name', nameFromLogin)

    const profile = await authAPI.verifyToken(res.data.accessToken)
    setUser(buildUser(profile.data.user || profile.data, nameFromLogin))
    return res.data
  }

  const logout = async () => {
    const token = getAccessToken()
    try { await authAPI.logout(token) } catch {}
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)