'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { BarChart } from "@tremor/react"

const data = [
  {
    name: "Your Store",
    value: 200,
    color: "blue",
  },
  {
    name: "Similar Stores",
    value: 320,
    color: "slate",
  },
  {
    name: "Nora Partners",
    value: 950,
    color: "green",
  },
]

interface PerformanceChartProps {
  withCard?: boolean;
}

export function PerformanceChart({ withCard = true }: PerformanceChartProps) {
  const chart = (
    <div className={`h-[300px] ${!withCard ? '-mx-2' : ''}`}>
      <BarChart
        data={data}
        index="name"
        categories={["value"]}
        colors={["blue", "slate", "emerald"]}
        valueFormatter={(value: number) => `$${value.toLocaleString()}`}
        yAxisWidth={48}
        className="h-[300px]"
        showAnimation={true}
      />
    </div>
  )

  if (!withCard) {
    return chart
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Performance Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chart}
      </CardContent>
    </Card>
  )
} 