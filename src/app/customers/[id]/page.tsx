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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Utensils, 
  DollarSign,
  Coffee,
  Pizza,
  Wine,
  Package
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { RecentOrders } from "@/components/recent-orders"
import { ChatSidebar } from "@/components/chat-sidebar"

// This would typically come from your API/database
const customerDetails = {
  id: "1",
  name: "Sarah Johnson",
  email: "sarah.j@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, New York, NY 10001",
  avatarUrl: "/avatars/01.png",
  allergens: [
    "Peanuts",
    "Shellfish",
    "Lactose"
  ],
  foodPreferences: {
    diet: "Vegetarian",
    spiceLevel: "Medium",
    cuisinePreferences: ["Italian", "Indian", "Thai"],
    dislikes: ["Mushrooms", "Olives"]
  },
  weeklyBudget: {
    meals: 150.00,
    snacks: 30.00,
    drinks: 25.00
  },
  orders: [
    {
      id: "1",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        avatar: "SJ"
      },
      product: "Margherita Pizza, Garlic Bread",
      status: "completed",
      amount: "$35.50",
      date: "2024-03-20T14:30:00Z"
    },
    {
      id: "2",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        avatar: "SJ"
      },
      product: "Vegetable Curry, Naan Bread",
      status: "completed",
      amount: "$28.75",
      date: "2024-03-15T18:45:00Z"
    },
    {
      id: "3",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        avatar: "SJ"
      },
      product: "Caesar Salad, Iced Tea",
      status: "cancelled",
      amount: "$15.99",
      date: "2024-03-10T12:15:00Z"
    },
    {
      id: "4",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        avatar: "SJ"
      },
      product: "Pasta Carbonara, Tiramisu",
      status: "completed",
      amount: "$42.50",
      date: "2024-03-05T19:30:00Z"
    },
    {
      id: "5",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        avatar: "SJ"
      },
      product: "Sushi Platter, Miso Soup",
      status: "completed",
      amount: "$55.25",
      date: "2024-02-28T20:00:00Z"
    }
  ]
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
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
                  <BreadcrumbLink href="/customers">Customers</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{customerDetails.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Customer Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={customerDetails.avatarUrl} alt={customerDetails.name} />
                <AvatarFallback>{customerDetails.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{customerDetails.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{customerDetails.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customerDetails.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{customerDetails.address}</span>
                </div>
              </CardContent>
            </Card>

            {/* Allergens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Allergens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {customerDetails.allergens.map((allergen) => (
                    <Badge key={allergen} variant="destructive">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Food Preferences */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Food Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold">Dietary Preference</h3>
                    <Badge variant="secondary" className="mt-2">
                      {customerDetails.foodPreferences.diet}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold">Spice Level</h3>
                    <Badge variant="secondary" className="mt-2">
                      {customerDetails.foodPreferences.spiceLevel}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Preferred Cuisines</h3>
                  <div className="flex flex-wrap gap-2">
                    {customerDetails.foodPreferences.cuisinePreferences.map((cuisine) => (
                      <Badge key={cuisine} variant="outline">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dislikes</h3>
                  <div className="flex flex-wrap gap-2">
                    {customerDetails.foodPreferences.dislikes.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Budget */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Weekly Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Pizza className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Meals</p>
                      <p className="text-2xl font-bold">${customerDetails.weeklyBudget.meals}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Coffee className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Snacks</p>
                      <p className="text-2xl font-bold">${customerDetails.weeklyBudget.snacks}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Wine className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Drinks</p>
                      <p className="text-2xl font-bold">${customerDetails.weeklyBudget.drinks}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replace CustomerOrdersTable with RecentOrders */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentOrders orders={customerDetails.orders} />
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