'use client'

import { useEffect } from 'react'
import { useStore } from '@/store'
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatSidebar } from "@/components/chat-sidebar"

interface PageProps {
  params: { id: string }
}

export default function MenuItemDetailsPage({ params }: PageProps) {
  const { id } = params
  const menuItems = useStore((state) => state.menu.items)
  const isLoading = useStore((state) => state.menu.isLoading)
  const menuItem = menuItems.find(item => item.id === id)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!menuItem) {
    return <div>Menu item not found</div>
  }

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
                  <BreadcrumbLink href="/menu">Menu</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{menuItem.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 row-span-2">
              {menuItem.imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={menuItem.imageUrl}
                    alt={menuItem.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl">{menuItem.name}</CardTitle>
                  <Badge variant={
                    menuItem.status === "available" ? "success" :
                    menuItem.status === "out_of_stock" ? "destructive" : "secondary"
                  }>
                    {menuItem.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{menuItem.description}</p>
                <p className="text-3xl font-bold">${menuItem.price.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Nutritional Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(menuItem.nutritionalInfo).map(([key, value]) => (
                    <div key={key} className="flex flex-col items-center justify-center p-2 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground capitalize">{key}</p>
                      <p className="text-lg font-semibold">{value}{key === 'calories' ? ' kcal' : 'g'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                <div>
                  <h3 className="font-semibold mb-2">Category</h3>
                  <Badge variant="outline" className="text-lg">{menuItem.category}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dietary</h3>
                  <div className="flex flex-wrap gap-2">
                    {menuItem.dietary.map((diet) => (
                      <Badge key={diet} variant="outline">
                        {diet}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Allergens</h3>
                  <div className="flex flex-wrap gap-2">
                    {menuItem.allergens.length > 0 ? (
                      menuItem.allergens.map((allergen) => (
                        <Badge key={allergen} variant="destructive">
                          {allergen}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No allergens</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 