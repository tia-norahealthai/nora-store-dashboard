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
import { MenuItems } from "@/components/menu-items"
import { ChatSidebar } from "@/components/chat-sidebar"
import { MenuItemData } from "@/components/menu-item-data"
import { getMenuItems } from "@/lib/data-collector"
import { Loader2 } from "lucide-react"

// Add this line to enable Suspense
export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  try {
    // Fetch menu items
    const menuItems = await getMenuItems()
    console.log('MenuPage received items:', {
      count: menuItems?.length,
      hasItems: Boolean(menuItems?.length),
      firstItem: menuItems?.[0]
    });

    if (!menuItems || menuItems.length === 0) {
      return (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-screen">
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
                      <BreadcrumbPage>Menu</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col gap-4 p-4 pt-0 w-full">
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="text-lg font-semibold">No menu items found</p>
                  <p className="text-sm mt-2">
                    Please verify that:
                  </p>
                  <ul className="text-sm list-disc mt-2 space-y-1">
                    <li>Your Supabase connection is correct</li>
                    <li>The menu_items table exists</li>
                    <li>There is data in the table</li>
                  </ul>
                </div>
              </div>
            </div>
          </SidebarInset>
          <ChatSidebar />
        </SidebarProvider>
      )
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
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
                    <BreadcrumbPage>Menu</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-4 p-4 pt-0 w-full">
              {menuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No menu items found</p>
                  <p className="text-sm">Add some items to get started</p>
                </div>
              ) : (
                <MenuItems initialItems={menuItems} />
              )}
            </div>
          </div>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    )
  } catch (error: any) {
    console.error('Menu page error:', error);
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-lg font-semibold">Error loading menu items</p>
        <p className="text-sm mt-2">{error.message}</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
      </div>
    )
  }
} 