import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon, type LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card className={cn(metricCardVariants({ trend }), className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
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
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </>
        )}
        
        {trendValue && (
          <div className="mt-4 flex items-center gap-1 text-sm">
            {trend === "up" && <ArrowUpIcon className="h-4 w-4" />}
            {trend === "down" && <ArrowDownIcon className="h-4 w-4" />}
            <span className="font-medium">{trendValue}</span>
          </div>
        )}

        {details && details.length > 0 && (
          <div className="space-y-1 mt-2">
            {details.map((detail, index) => (
              <p 
                key={index} 
                className="text-xs text-muted-foreground flex justify-between"
              >
                <span>{detail.label}:</span>
                <span>{detail.value}</span>
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 