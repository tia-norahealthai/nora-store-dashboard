import { useAuth } from '@/components/providers/supabase-auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuthorization(allowedRoles: string[]) {
  const { user, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const hasPermission = allowedRoles.some(role => hasRole(role))
    if (!hasPermission) {
      router.push('/unauthorized')
    }
  }, [user, hasRole, router, allowedRoles])

  return {
    isAuthorized: allowedRoles.some(role => hasRole(role))
  }
} 