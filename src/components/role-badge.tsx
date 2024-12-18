'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/supabase-auth-provider'
import { Loader2, ShieldCheck, Store } from 'lucide-react'

export function RoleBadge() {
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { hasRole } = useAuth()

  useEffect(() => {
    async function checkRoles() {
      try {
        const isAdmin = await hasRole('admin')
        if (isAdmin) {
          setRole('Admin')
          return
        }
        
        const isBusinessOwner = await hasRole('business_owner')
        if (isBusinessOwner) {
          setRole('Business Owner')
        }
      } catch (error) {
        console.error('Error checking roles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkRoles()
  }, [hasRole])

  if (isLoading) {
    return (
      <Badge 
        variant="outline" 
        className="gap-2 bg-muted/50"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading...
      </Badge>
    )
  }

  if (!role) return null

  return (
    <Badge 
      variant="secondary"
      className="gap-2 font-normal"
    >
      {role === 'Admin' ? (
        <ShieldCheck className="h-3 w-3" />
      ) : (
        <Store className="h-3 w-3" />
      )}
      {role}
    </Badge>
  )
} 