import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
import { OpportunitiesRecap } from "@/components/opportunities-recap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatSidebar } from "@/components/chat-sidebar"
import { TrendingUp, ShoppingBag, Users, ArrowUpRight } from "lucide-react"
import { RecommendedAction } from "@/components/recommended-action"
import { Suspense } from "react"
import { VittoriaProvider } from "@/contexts/vittoria-context"
import { GrowthPotentialCard } from "@/components/growth-potential-card"

function RecommendedActions() {
  return (
    <VittoriaProvider pageType="opportunities" initialData={null}>
      <div className="space-y-2">
        {/* <p className="text-lg font-semibold">Recommended Actions</p> */}
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

export default function OpportunitiesPage() {
  return (
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
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Opportunities</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 p-4 pt-0">
            <OpportunitiesRecap 
              percentage={35} 
              missedRevenue={12450}
              showPerformanceChart={true}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <GrowthPotentialCard
                potentialIncrease={24}
                orderValueIncrease={15}
                retentionIncrease={15}
                className="h-[240px]"
              />
              <Card className="h-[240px]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2  text-2xl font-semibold">
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