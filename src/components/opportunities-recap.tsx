"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { AlertTriangle, ArrowRight } from "lucide-react"
import { PerformanceChart } from "@/components/performance-chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface OpportunitiesRecapProps {
  percentage: number
  missedRevenue?: number
  showPerformanceChart?: boolean
  isDashboard?: boolean
}

export function OpportunitiesRecap({ 
  percentage, 
  missedRevenue,
  showPerformanceChart = false,
  isDashboard = false
}: OpportunitiesRecapProps) {
  return (
    <Card className={showPerformanceChart ? "col-span-2 h-auto" : "h-[240px]"}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Missed Opportunities
          </div>
          {isDashboard && (
            <Link href="/opportunities">
              <Button variant="ghost" className="gap-2">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex ${showPerformanceChart ? 'flex-row gap-8' : 'flex-row items-center gap-4'}`}>
          <div className="flex h-auto justify-center flex-col gap-4 flex-1">
            <div className={`flex ${showPerformanceChart ? 'flex-col' : 'flex-row'} items-center gap-8`}>
              <div className="w-full max-w-[120px] aspect-square">
                <CircularProgressbar
                  value={percentage}
                  text={`${percentage}%`}
                  styles={buildStyles({
                    textSize: isDashboard ? '1.8rem' : '2.3rem',
                    pathColor: 'rgb(234 179 8)',
                    textColor: '#666',
                    trailColor: '#f5f5f5',
                    pathTransitionDuration: 0.5,
                  })}
                />
              </div>
              <div className={`flex-1 ${showPerformanceChart ? 'text-center' : ''}`}>
                <p className="text-sm text-muted-foreground">
                  Orders with potential value increase
                </p>
                {missedRevenue && (
                  <p className="mt-1 text-3xl font-semibold text-yellow-600">
                    Missed revenue: ${missedRevenue.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          {showPerformanceChart && (
            <div className="flex-1">
              <PerformanceChart withCard={false} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 