'use client'

import { useAuthorization } from '@/hooks/use-authorization'
import { ReactNode } from 'react'

interface RequireRoleProps {
  children: ReactNode
  allowedRoles: string[]
}

export function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { isAuthorized } = useAuthorization(allowedRoles)

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
} 