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
import { Button } from "@/components/ui/button"
import { 
  DollarSign, 
  Edit, 
  Tag, 
  Utensils, 
  AlertCircle,
  ArrowLeft
} from "lucide-react"

// This would typically come from your API/database
const mockMenuItem = {
  id: "1",
  name: "Margherita Pizza",
  description: "Fresh tomatoes, mozzarella, basil, and olive oil",
  price: 14.99,
  category: "Pizza",
  dietary: ["vegetarian"],
  status: "available",
  imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop",
  ingredients: [
    "Fresh Tomatoes",
    "Mozzarella Cheese",
    "Fresh Basil",
    "Extra Virgin Olive Oil",
    "Pizza Dough",
    "Salt",
    "Black Pepper"
  ],
  nutritionalInfo: {
    calories: 850,
    protein: 35,
    carbs: 98,
    fat: 38,
    fiber: 4
  },
  preparationTime: 20, // in minutes
  spiceLevel: "mild",
  allergens: ["dairy", "gluten"],
}

export default function MenuItemDetailsPage({ params }: { params: { id: string } }) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "available":
        return "success"
      case "out_of_stock":
        return "destructive"
      case "coming_soon":
        return "secondary"
      default:
        return "default"
    }
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
                  <BreadcrumbPage>{mockMenuItem.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Item Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/menu">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Menu
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Item
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Image and Basic Info */}
            <Card>
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={mockMenuItem.imageUrl}
                  alt={mockMenuItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{mockMenuItem.name}</CardTitle>
                    <p className="text-muted-foreground mt-2">
                      {mockMenuItem.description}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(mockMenuItem.status)}>
                    {mockMenuItem.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                  </div>
                  <span>{mockMenuItem.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Price:</span>
                  </div>
                  <span className="font-semibold">
                    ${mockMenuItem.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Preparation Time:</span>
                  </div>
                  <span>{mockMenuItem.preparationTime} minutes</span>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <div className="space-y-4">
              {/* Dietary Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Dietary Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dietary Options</h3>
                    <div className="flex flex-wrap gap-2">
                      {mockMenuItem.dietary.map((diet) => (
                        <Badge key={diet} variant="outline">
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Allergens</h3>
                    <div className="flex flex-wrap gap-2">
                      {mockMenuItem.allergens.map((allergen) => (
                        <Badge key={allergen} variant="destructive">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nutritional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Nutritional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {Object.entries(mockMenuItem.nutritionalInfo).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-sm text-muted-foreground capitalize">
                          {key}
                        </p>
                        <p className="text-lg font-semibold">
                          {value}{key === "calories" ? "kcal" : "g"}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockMenuItem.ingredients.map((ingredient) => (
                      <Badge key={ingredient} variant="secondary">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 