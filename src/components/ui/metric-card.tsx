import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, type LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const metricValueVariants = cva("text-2xl font-bold", {
  variants: {
    trend: {
      up: "text-green-500",
      down: "text-red-500",
      neutral: "text-foreground",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
})

interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricValueVariants> {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string | number
  details?: {
    label: string
    value: string | number
  }[]
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend = "neutral",
  trendValue,
  details,
  loading = false,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card className={cn("rounded-xl border bg-card text-card-foreground", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            {description && (
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            )}
          </div>
        ) : (
          <>
            <div className="flex items-baseline space-x-2">
              <div className={metricValueVariants({ trend })}>{value}</div>
              {trend !== "neutral" && trendValue && (
                <span className={cn(
                  "inline-flex items-center text-sm font-medium",
                  trend === "up" ? "text-green-500" : "text-red-500"
                )}>
                  {trend === "up" ? (
                    <ArrowUpIcon className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-4 w-4" />
                  )}
                  {trendValue}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {details && (
              <div className="mt-4 space-y-2">
                {details.map((detail, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{detail.label}</span>
                    <span>{detail.value}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 