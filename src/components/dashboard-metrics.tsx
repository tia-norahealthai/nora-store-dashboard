"use client"

import { useEffect, useRef } from 'react'
import { DashboardMetrics } from '@/types/data-types'

interface DashboardMetricsDataProps {
  metrics: {
    revenue: number
    activeUsers: number
    conversionRate: number
    pendingOrders: number
    totalOrders: number
  }
}

export function DashboardMetricsData({ metrics }: DashboardMetricsDataProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      // Add metrics data attributes
      ref.current.setAttribute('data-metrics', '')
      ref.current.setAttribute('data-revenue', String(metrics.revenue))
      ref.current.setAttribute('data-active-users', String(metrics.activeUsers))
      ref.current.setAttribute('data-conversion-rate', String(metrics.conversionRate))
      ref.current.setAttribute('data-pending-orders', String(metrics.pendingOrders))
      ref.current.setAttribute('data-total-orders', String(metrics.totalOrders))
    }
  }, [metrics])

  return <div ref={ref} className="hidden" />
} 