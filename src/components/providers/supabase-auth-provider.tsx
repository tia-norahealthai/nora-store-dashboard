'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
  hasRole: (roleName: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  hasRole: async () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const hasRole = async (roleName: string): Promise<boolean> => {
    if (!user) return false
    
    try {
      const { data: roleCheck, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', roleName)
        .maybeSingle()

      if (error) {
        console.error('Error checking role:', error)
        return false
      }

      return !!roleCheck
    } catch (error) {
      console.error('Error checking role:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 