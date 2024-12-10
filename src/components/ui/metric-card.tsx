import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, type LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const metricCardVariants = cva("rounded-xl border bg-card p-6 text-card-foreground", {
  variants: {
    trend: {
      up: "text-green-500",
      down: "text-red-500",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
})

interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string | number
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend = "neutral",
  trendValue,
  loading = false,
  className,
  ...props
}: MetricCardProps) {
  return (
    <div className={cn(metricCardVariants({ trend }), className)} {...props}>
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-muted-foreground">{title}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {trendValue && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          {trend === "up" && <ArrowUpIcon className="h-4 w-4" />}
          {trend === "down" && <ArrowDownIcon className="h-4 w-4" />}
          <span className="font-medium">{trendValue}</span>
        </div>
      )}
    </div>
  )
} 