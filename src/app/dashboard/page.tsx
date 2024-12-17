import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"
import { MetricCard } from "@/components/ui/metric-card"
import { 
  DollarSign, 
  Users, 
  Receipt, 
  Store, 
  Clock,
  Calculator,
  ShoppingBag,
} from "lucide-react"
import { OpportunitiesRecap } from "@/components/opportunities-recap"
import { GrowthPotentialCard } from "@/components/growth-potential-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecommendedAction } from "@/components/recommended-action"
import { Suspense } from "react"
import { MariaProvider } from "@/contexts/maria-context"

function RecommendedActions() {
  return (
    <MariaProvider pageType="dashboard" initialData={null}>
      <div className="space-y-2">
        <ul className="space-y-4 text-base">
          <li>
            <RecommendedAction
              title="Optimize Menu Pricing"
              description="Analyze and adjust menu prices based on demand patterns"
            />
          </li>
          <li>
            <RecommendedAction
              title="Launch Happy Hour Promotion"
              description="Create special offers during slower business hours"
            />
          </li>
          <li>
            <RecommendedAction
              title="Customer Feedback Campaign"
              description="Start collecting structured feedback from your customers"
            />
          </li>
          <li>
            <RecommendedAction
              title="Staff Performance Analysis"
              description="Review staff efficiency and identify training needs"
            />
          </li>
        </ul>
      </div>
    </MariaProvider>
  )
}

export default function DashboardPage() {
  // Mock data for restaurant metrics
  const restaurantMetrics = {
    totalOrders: 1890,
    totalRevenue: 125000.00,
    averageOrderValue: 65.50,
    averageCostPerOrder: 45.85,
    fixedFeeRate: 0.10,
    cashbackRate: 0.05,
    cashbackPercentage: 5,
    ROAS: 2.8,
    marketingCosts: 15000,
    repeatCustomersPercentage: 42.5
  }

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Total Orders"
                value={restaurantMetrics.totalOrders.toString()}
                icon={Receipt}
              />
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(restaurantMetrics.totalRevenue)}
                icon={DollarSign}
              />
              <MetricCard
                title="Average Order"
                value={formatCurrency(restaurantMetrics.averageOrderValue)}
                description="Per order value"
                icon={Store}
              />
              <MetricCard
                title="Average Cost"
                value={formatCurrency(restaurantMetrics.averageCostPerOrder)}
                icon={Clock}
                details={[
                  {
                    label: `Fixed Fee (${restaurantMetrics.fixedFeeRate * 100}%)`,
                    value: formatCurrency(restaurantMetrics.averageOrderValue * restaurantMetrics.fixedFeeRate)
                  },
                  {
                    label: `Cashback (${restaurantMetrics.cashbackPercentage}%)`,
                    value: formatCurrency(restaurantMetrics.averageOrderValue * restaurantMetrics.cashbackRate)
                  }
                ]}
              />
              <MetricCard
                title="ROAS"
                value={restaurantMetrics.ROAS.toFixed(2)}
                icon={Calculator}
                description="Return on Ad Spend"
                details={[
                  {
                    label: "Marketing Costs",
                    value: formatCurrency(restaurantMetrics.marketingCosts)
                  },
                  {
                    label: "Revenue",
                    value: formatCurrency(restaurantMetrics.totalRevenue)
                  }
                ]}
              />
              <MetricCard
                title="Repeat Customers"
                value={`${restaurantMetrics.repeatCustomersPercentage.toFixed(1)}%`}
                icon={Users}
                description="Returning customer rate"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <OpportunitiesRecap 
                percentage={35} 
                missedRevenue={12450}
              />
              <GrowthPotentialCard
                potentialIncrease={24}
                orderValueIncrease={15}
                retentionIncrease={15}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <ShoppingBag className="h-4 w-4" />
                    Ways to improve your business
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>Loading recommendations...</div>}>
                    <RecommendedActions />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 