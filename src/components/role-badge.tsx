'use client'

import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldCheck, Store } from 'lucide-react'
import { useAuthorization } from '@/hooks/use-authorization'

export function RoleBadge() {
  const { role, isLoading, error } = useAuthorization()

  if (error) {
    return (
      <Badge 
        variant="destructive" 
        className="gap-2 font-normal"
      >
        {error}
      </Badge>
    )
  }

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