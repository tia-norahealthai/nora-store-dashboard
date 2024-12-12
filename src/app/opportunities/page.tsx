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
import { ArrowUpRight, TrendingUp, ShoppingBag, Users } from "lucide-react"
import { PerformanceChart } from "@/components/performance-chart"

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
              <Card className="h-[240px]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2  text-2xl font-semibold">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Growth Potential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold">+24%</p>
                      <p className="text-sm text-muted-foreground">Potential revenue increase</p>
                    </div>
                    <ul className="space-y-2 text-base text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        Average order value could increase by $15
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        Customer retention potential: 15% higher
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="space-y-4">
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold">Top Missed Opportunities</p>
                        <ul className="space-y-4 text-base">
                          <li>
                            <p className="font-semibold">Bundle Offers</p>
                            <p className="text-muted-foreground">Bundle offers not presented to eligible customers</p>
                          </li>
                          <li>
                            <p className="font-semibold">Seasonal Promotions</p>
                            <p className="text-muted-foreground">Seasonal promotions missed during peak hours</p>
                          </li>
                          <li>
                            <p className="font-semibold">Loyalty Program</p>
                            <p className="text-muted-foreground">Loyalty program upgrades not suggested</p>
                          </li>
                          <li>
                            <p className="font-semibold">Premium Products</p>
                            <p className="text-muted-foreground">Premium product alternatives not offered</p>
                          </li>
                          <li>
                            <p className="font-semibold">Customer Engagement</p>
                            <p className="text-muted-foreground">Follow-up engagement not initiated</p>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold">Recommended Actions</p>
                        <ul className="space-y-4 text-base">
                          <li>
                            <p className="font-semibold">Automation System</p>
                            <p className="text-muted-foreground">Implement automated bundle suggestions</p>
                          </li>
                          <li>
                            <p className="font-semibold">Promotion Timing</p>
                            <p className="text-muted-foreground">Set up time-based promotion triggers</p>
                          </li>
                          <li>
                            <p className="font-semibold">Loyalty Notifications</p>
                            <p className="text-muted-foreground">Create loyalty program notification system</p>
                          </li>
                          <li>
                            <p className="font-semibold">Product Recommendations</p>
                            <p className="text-muted-foreground">Develop product recommendation engine</p>
                          </li>
                          <li>
                            <p className="font-semibold">Follow-up System</p>
                            <p className="text-muted-foreground">Establish follow-up communication workflow</p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
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