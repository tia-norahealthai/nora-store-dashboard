"use client"

import { useState, useEffect } from "react"
import { MetricCard } from "@/components/ui/metric-card"
import { DollarSign, Receipt, Store, Clock, Calculator, Users } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { RestaurantMetrics as RestaurantMetricsType } from "@/types/restaurant"

interface RestaurantMetricsCardProps {
  restaurantId: string
  initialData: RestaurantMetricsType
}

export function RestaurantMetricsCards({ 
  restaurantId, 
  initialData 
}: RestaurantMetricsCardProps) {
  const [metrics, setMetrics] = useState(initialData)
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        title="Total Orders"
        value={metrics.totalOrders}
        icon={Receipt}
      />
      <MetricCard
        title="Total Revenue"
        value={formatCurrency(metrics.totalRevenue)}
        icon={DollarSign}
      />
      <MetricCard
        title="Average Order"
        value={formatCurrency(metrics.averageOrderValue)}
        description="Per order value"
        icon={Store}
      />
      <MetricCard
        title="Average Cost"
        value={formatCurrency(metrics.averageCostPerOrder)}
        icon={Clock}
        details={[
          {
            label: "Fixed Fee (10%)",
            value: formatCurrency(metrics.averageOrderValue * metrics.fixedFeeRate)
          },
          {
            label: `Cashback (${metrics.cashbackPercentage}%)`,
            value: formatCurrency(metrics.averageOrderValue * metrics.cashbackRate)
          }
        ]}
      />
      <MetricCard
        title="ROAS"
        value={metrics.ROAS.toFixed(2)}
        icon={Calculator}
        description="Return on Ad Spend"
        details={[
          {
            label: "Marketing Costs",
            value: formatCurrency(metrics.marketingCosts)
          },
          {
            label: "Revenue",
            value: formatCurrency(metrics.totalRevenue)
          }
        ]}
      />
      <MetricCard
        title="Repeat Customers"
        value={`${metrics.repeatCustomersPercentage.toFixed(1)}%`}
        icon={Users}
        description="Returning customer rate"
      />
    </div>
  )
} 