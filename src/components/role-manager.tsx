'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useAuthorization } from '@/hooks/use-authorization'

interface RoleManagerProps {
  userId: string
  currentRole?: string
}

export function RoleManager({ userId, currentRole }: RoleManagerProps) {
  const [role, setRole] = useState(currentRole)
  const [isLoading, setIsLoading] = useState(false)
  const { isAdmin } = useAuthorization()

  const handleRoleChange = async (newRole: string) => {
    if (!isAdmin) {
      toast.error('Unauthorized', {
        description: 'Only admins can change user roles'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/users/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      })

      if (!response.ok) throw new Error('Failed to update role')

      setRole(newRole)
      toast.success('Role updated successfully')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="flex items-center gap-2">
      <Select
        value={role}
        onValueChange={handleRoleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="business_owner">Business Owner</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 