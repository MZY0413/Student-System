'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from './types'
import { getCurrentUser, login as storeLogin, logout as storeLogout } from './store'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<User | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<User | null> => {
    const loggedInUser = await storeLogin(username, password)
    if (loggedInUser) {
      setUser(loggedInUser)
      return loggedInUser
    }
    return null
  }

  const logout = () => {
    storeLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
