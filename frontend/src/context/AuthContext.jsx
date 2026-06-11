import React, { createContext, useState, useEffect } from 'react'
import authService from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Charger l'utilisateur au montage (depuis le cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.me()
        setUser(userData)
      } catch (err) {
        // Pas authentifié (pas de cookie valide)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials)
      setUser(userData)
      return userData
    } catch (err) {
      throw err
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await authService.me()
      setUser(userData)
    } catch (err) {
      console.error('Erreur refresh user:', err)
    }
  }

  const updateUser = (patch) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    updateUser,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
