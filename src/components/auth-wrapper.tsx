"use client"

import { useAuthorization } from "@/hooks/use-authorization"
import { redirect } from 'next/navigation'
import { ReactNode, useEffect } from "react"

interface AuthWrapperProps {
  children: ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAdmin, isLoading } = useAuthorization()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      redirect('/dashboard')
    }
  }, [isAdmin, isLoading])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
} 