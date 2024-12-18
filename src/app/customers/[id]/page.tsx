import { notFound } from "next/navigation"
import { getCustomerById } from "@/lib/data-collector"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { CustomerOrdersTable } from "@/components/customer-orders-table"
import { Calendar, User, DollarSign, Heart, Scale } from "lucide-react"
import { CustomerMealPlan } from "@/components/customer-meal-plan"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function CustomerPage({ params }: PageProps) {
  try {
    const customer = await getCustomerById(params.id)

    if (!customer) {
      notFound()
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-auto">
          <header className="sticky top-0 z-10 bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                    <BreadcrumbLink href="/customers">Customers</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{customer.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="text-lg font-medium">{customer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="text-lg">{customer.email}</p>
                  </div>
                  {customer.phone && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Phone</Label>
                      <p className="text-lg">{customer.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm text-muted-foreground">Customer Since</Label>
                    <p className="text-lg">{formatDate(customer.created_at)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Health Information */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Health Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Height</Label>
                    <p className="text-lg">
                      {customer.height_feet ? `${customer.height_feet}'${customer.height_inches || 0}"` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Weight</Label>
                    <p className="text-lg">
                      {customer.weight ? `${customer.weight} lbs` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Weight Goal</Label>
                    <p className="text-lg">
                      {customer.weight_goal ? `${customer.weight_goal} lbs` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Weight Goal Pace</Label>
                    <p className="text-lg capitalize">
                      {customer.weight_goal_pace || 'Not set'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Dietary Information */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Dietary Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Dietary Preferences</Label>
                    <p className="text-lg">
                      {customer.dietary_preferences?.length > 0 
                        ? customer.dietary_preferences.join(', ') 
                        : 'None'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Food Preferences</Label>
                    <p className="text-lg">
                      {customer.food_preferences?.length > 0 
                        ? customer.food_preferences.join(', ') 
                        : 'None'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Allergens</Label>
                    <p className="text-lg">
                      {customer.allergens?.length > 0 
                        ? customer.allergens.join(', ') 
                        : 'None'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Information */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Budget Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Drinks Budget</Label>
                    <p className="text-lg font-medium">
                      ${customer.drinks_budget?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Meals Budget</Label>
                    <p className="text-lg font-medium">
                      ${customer.meals_budget?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Snacks Budget</Label>
                    <p className="text-lg font-medium">
                      ${customer.snacks_budget?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Meal Plan */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Meal Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerMealPlan customerId={customer.id} />
                </CardContent>
              </Card>

              {/* Order History */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Order History</CardTitle>
                </CardHeader>
                <CustomerOrdersTable orders={customer.orders || []} />
              </Card>
            </div>
          </div>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    )
  } catch (error) {
    throw new Error('Failed to load customer data')
  }
} 