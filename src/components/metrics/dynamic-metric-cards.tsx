"use client"

import { useState, useEffect } from "react"
import { MetricCard } from "@/components/ui/metric-card"
import { DollarSign, Receipt } from "lucide-react"

function useMetricData(metricType: string, params?: Record<string, any>) {
  const [data, setData] = useState<{
    value: string | number
    trend?: "up" | "down" | "neutral"
    trendValue?: string | number
    loading: boolean
    error?: string
  }>({
    value: 0,
    loading: true,
  })

  useEffect(() => {
    async function fetchMetricData() {
      try {
        const response = await fetch(`/api/metrics/${metricType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })
        
        if (!response.ok) throw new Error('Failed to fetch metric data')
        
        const result = await response.json()
        setData({
          value: result.value,
          trend: result.trend,
          trendValue: result.trendValue,
          loading: false
        })
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load metric data'
        }))
      }
    }

    fetchMetricData()
  }, [metricType, JSON.stringify(params)])

  return data
}

export function RevenueMetricCard({ restaurantId }: { restaurantId: string }) {
  const { value, trend, trendValue, loading } = useMetricData('revenue', { restaurantId })
  
  return (
    <MetricCard
      title="Total Revenue"
      value={value}
      icon={DollarSign}
      trend={trend}
      trendValue={trendValue}
      loading={loading}
    />
  )
}

export function OrdersMetricCard({ restaurantId }: { restaurantId: string }) {
  const { value, trend, trendValue, loading } = useMetricData('orders', { restaurantId })
  
  return (
    <MetricCard
      title="Total Orders"
      value={value}
      icon={Receipt}
      trend={trend}
      trendValue={trendValue}
      loading={loading}
    />
  )
} 