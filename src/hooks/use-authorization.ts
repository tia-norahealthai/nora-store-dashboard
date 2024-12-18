import { useAuth } from '@/components/providers/supabase-auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuthorization(allowedRoles: string[]) {
  const { user, hasRole } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuthorization() {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const hasPermission = await Promise.all(
          allowedRoles.map(role => hasRole(role))
        ).then(results => results.some(Boolean))

        setIsAuthorized(hasPermission)
        
        if (!hasPermission) {
          router.push('/unauthorized')
        }
      } catch (error) {
        console.error('Authorization check failed:', error)
        router.push('/unauthorized')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorization()
  }, [user, hasRole, router, allowedRoles])

  return { isAuthorized, isLoading }
} 