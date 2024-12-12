import { TrendingUp, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GrowthPotentialCardProps {
  potentialIncrease: number
  orderValueIncrease: number
  retentionIncrease: number
  className?: string
}

export function GrowthPotentialCard({
  potentialIncrease,
  orderValueIncrease,
  retentionIncrease,
  className
}: GrowthPotentialCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Growth Potential
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold">+{potentialIncrease}%</p>
            <p className="text-sm text-muted-foreground">Potential revenue increase</p>
          </div>
          <ul className="space-y-2 text-base text-muted-foreground">
            <li className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              Average order value could increase by ${orderValueIncrease}
            </li>
            <li className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              Customer retention potential: {retentionIncrease}% higher
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 