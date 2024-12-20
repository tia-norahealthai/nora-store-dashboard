"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/providers/supabase-auth-provider'

const DEFAULT_PATHS = [
  '/dashboard',
  '/orders',
  '/menu',
  '/opportunities',
  '/vittoria',
  '/vittoria/history',
  '/settings'
]

export function useAuthorization() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [allowedPaths, setAllowedPaths] = useState<string[]>(DEFAULT_PATHS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true

    async function checkPermissions() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // Get user's roles
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)

        if (rolesError) {
          console.error('Error fetching roles:', rolesError)
          throw new Error('Failed to fetch roles')
        }

        // Check if user is admin
        const hasAdminRole = roles?.some(r => r.role === 'admin') ?? false
        
        if (isMounted) {
          setIsAdmin(hasAdminRole)
          
          if (hasAdminRole) {
            // Admin has access to all paths except /dashboard
            setAllowedPaths([
              '/orders',
              '/customers',
              '/restaurants',
              '/menu',
              '/opportunities',
              '/invoices',
              '/vittoria',
              '/vittoria/history',
              '/settings'
            ])
          } else {
            // Business owner always has access to default paths
            setAllowedPaths(DEFAULT_PATHS)
          }
        }
      } catch (error) {
        console.error('Authorization error:', error)
        if (isMounted) {
          setError('Error loading permissions')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkPermissions()

    return () => {
      isMounted = false
    }
  }, [user, supabase])

  return {
    isAdmin,
    allowedPaths,
    isLoading,
    error,
    role: isAdmin ? 'Admin' : 'Business Owner'
  }
} 