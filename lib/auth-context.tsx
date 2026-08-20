'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from './types'
import { supabase } from './supabase/client'
import { login as storeLogin, logout as storeLogout, getUserByAuthId } from './store'

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

  // 用 Supabase Auth 会话作为唯一登录态来源（刷新页面自动恢复，登出自动清空）
  useEffect(() => {
    let cancelled = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await getUserByAuthId(session.user.id)
        if (!cancelled) setUser(u)
      } else {
        if (!cancelled) setUser(null)
      }
      if (!cancelled) setIsLoading(false)
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
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
    void storeLogout()
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
