"use client"

import { useAuthorization } from "@/hooks/use-authorization"
import { redirect } from 'next/navigation'
import { ReactNode, useEffect } from "react"

interface BusinessOwnerWrapperProps {
  children: ReactNode
}

export function BusinessOwnerWrapper({ children }: BusinessOwnerWrapperProps) {
  const { isAdmin, isLoading } = useAuthorization()

  useEffect(() => {
    if (!isLoading && isAdmin) {
      redirect('/')
    }
  }, [isAdmin, isLoading])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
} 