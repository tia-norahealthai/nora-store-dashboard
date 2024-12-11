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
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/utils"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function CustomerPage({ params }: PageProps) {
  const resolvedParams = await params
  const customer = await getCustomerById(resolvedParams.id)
  
  if (!customer) {
    notFound()
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Customer Information</h2>
              </div>
              <div className="space-y-4">
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
                {customer.address && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <p className="text-lg">{customer.address}</p>
                  </div>
                )}
                {customer.food_preferences && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Food Preferences</Label>
                    <p className="text-lg">{customer.food_preferences}</p>
                  </div>
                )}
                {customer.dietary_preferences && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Dietary Preferences</Label>
                    <p className="text-lg">{customer.dietary_preferences}</p>
                  </div>
                )}
                {customer.allergens && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Allergens</Label>
                    <p className="text-lg">{customer.allergens}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {customer.snacks_budget && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Snacks Budget</Label>
                      <p className="text-lg">${customer.snacks_budget}</p>
                    </div>
                  )}
                  {customer.meals_budget && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Meals Budget</Label>
                      <p className="text-lg">${customer.meals_budget}</p>
                    </div>
                  )}
                  {customer.drinks_budget && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Drinks Budget</Label>
                      <p className="text-lg">${customer.drinks_budget}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Customer Since</Label>
                  <p className="text-lg">{formatDate(customer.created_at)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Order History</h2>
              </div>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-4">
                  {customer.orders.map((order: any) => (
                    <div key={order.id} className="border-b pb-2">
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                      <p className="text-sm">
                        Status: <span className="capitalize">{order.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No orders yet</p>
              )}
            </Card>
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 