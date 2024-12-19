import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
  Receipt,
  DollarSign,
  ShoppingBag,
  Clock,
  Calculator,
  Users
} from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { DashboardMetricsData } from '@/components/dashboard-metrics'
import { BusinessOwnerWrapper } from "@/components/business-owner-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GrowthPotentialCard } from "@/components/growth-potential-card"
import { RecommendedAction } from "@/components/recommended-action"
import { Suspense } from "react"
import { VittoriaProvider } from "@/contexts/vittoria-context"

function RecommendedActions() {
  return (
    <VittoriaProvider pageType="opportunities" initialData={null}>
      <div className="space-y-2">
        <ul className="space-y-4 text-base">
          <li>
            <RecommendedAction
              title="Set Up Smart Bundles"
              description="Configure automated product bundles based on purchase history"
            />
          </li>
          <li>
            <RecommendedAction
              title="Schedule Peak-Time Promotions"
              description="Launch targeted promotions during your highest traffic hours"
            />
          </li>
          <li>
            <RecommendedAction
              title="Upgrade Loyalty Rewards"
              description="Design and launch new tier-based loyalty rewards program"
            />
          </li>
          <li>
            <RecommendedAction
              title="Enable Smart Recommendations"
              description="Activate AI-powered product suggestions for each customer"
            />
          </li>
        </ul>
      </div>
    </VittoriaProvider>
  )
}

export default function DashboardPage() {
  // Mock data matching the image
  const dashboardMetrics = {
    totalOrders: 17,
    totalRevenue: 1711.72,
    averageOrder: 100.69,
    averageCost: {
      total: 40.28,
      fixedFee: 10.07,  // 10%
      cashback: 30.21   // 30%
    },
    roas: {
      value: 2.50,
      marketingCosts: 684.69,
      revenue: 1711.72
    },
    repeatCustomers: {
      percentage: 60.0,
      description: "Returning customer rate"
    }
  }

  return (
    <BusinessOwnerWrapper>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Orders */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-normal text-muted-foreground">Total Orders</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.totalOrders}</div>
                  </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-normal text-muted-foreground">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardMetrics.totalRevenue.toFixed(2)}</div>
                  </CardContent>
                </Card>

                {/* Average Order */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-normal text-muted-foreground">Average Order</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardMetrics.averageOrder.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Per order value</p>
                  </CardContent>
                </Card>

                {/* Average Cost */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-normal text-muted-foreground">Average Cost</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${dashboardMetrics.averageCost.total}</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fixed Fee (10%)</span>
                        <span>${dashboardMetrics.averageCost.fixedFee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cashback (30%)</span>
                        <span>${dashboardMetrics.averageCost.cashback}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ROAS */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-normal text-muted-foreground">ROAS</CardTitle>
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.roas.value}</div>
                    <p className="text-xs text-muted-foreground">Return on Ad Spend</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Marketing Costs</span>
                        <span>${dashboardMetrics.roas.marketingCosts}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Revenue</span>
                        <span>${dashboardMetrics.roas.revenue}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Repeat Customers */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-normal text-muted-foreground">Repeat Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardMetrics.repeatCustomers.percentage}%</div>
                    <p className="text-xs text-muted-foreground">{dashboardMetrics.repeatCustomers.description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Growth Potential and Customer Segments */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <GrowthPotentialCard
                  potentialIncrease={24}
                  orderValueIncrease={15}
                  retentionIncrease={15}
                  className="h-[240px]"
                />
                <Card className="h-[240px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
                      <Users className="h-4 w-4 text-blue-500" />
                      Customer Segments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">High-Value Customers</p>
                          <p className="text-sm font-medium">45%</p>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-full w-[45%] rounded-full bg-blue-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Regular Customers</p>
                          <p className="text-sm font-medium">35%</p>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-full w-[35%] rounded-full bg-blue-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">New Customers</p>
                          <p className="text-sm font-medium">20%</p>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-full w-[20%] rounded-full bg-blue-300" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Actions */}
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
        <DashboardMetricsData metrics={dashboardMetrics} />
      </SidebarProvider>
    </BusinessOwnerWrapper>
  )
} 