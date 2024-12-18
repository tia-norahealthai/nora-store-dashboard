'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuthorization } from '@/hooks/use-authorization'

interface AdminRoleManagerProps {
  userId: string
}

export function AdminRoleManager({ userId }: AdminRoleManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { isAdmin } = useAuthorization()

  const assignAdminRole = async () => {
    if (!isAdmin) {
      toast.error('Unauthorized', {
        description: 'Only admins can assign admin roles'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/users/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error('Failed to assign admin role')

      toast.success('Admin role assigned successfully')
    } catch (error) {
      console.error('Error assigning admin role:', error)
      toast.error('Failed to assign admin role')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={assignAdminRole}
      disabled={isLoading}
    >
      {isLoading ? 'Assigning...' : 'Make Admin'}
    </Button>
  )
} 