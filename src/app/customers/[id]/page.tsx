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
import Link from "next/link"
import { CustomerOrdersTable } from "@/components/customer-orders-table"

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function CustomerPage({ params }: PageProps) {
  const customer = await getCustomerById(params.id)
  
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
                <div>
                  <Label className="text-sm text-muted-foreground">Customer Since</Label>
                  <p className="text-lg">{formatDate(customer.created_at)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Budget Information</h2>
              </div>
              <div className="space-y-4">
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
              </div>
            </Card>

            <Card className="md:col-span-2">
              <div className="mb-4 p-6 pb-0">
                <h2 className="text-lg font-semibold">Order History</h2>
              </div>
              <CustomerOrdersTable orders={customer.orders || []} />
            </Card>
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 