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
import { 
  DollarSign, 
  UtensilsCrossed, 
  Tag,
  AlertCircle,
  ImageIcon
} from "lucide-react"

// This would typically come from your API/database
const menuItemDetails = {
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
    fat: 28
  },
  preparationTime: "15-20 minutes",
  popularity: "High",
  reviews: 4.8
}

export default function MenuItemDetailsPage({ params }: { params: { id: string } }) {
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
                  <BreadcrumbLink href="/menu">Menu</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{menuItemDetails.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Menu Item Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{menuItemDetails.name}</h1>
              <p className="text-muted-foreground">{menuItemDetails.description}</p>
            </div>
            <Badge variant={menuItemDetails.status === "available" ? "success" : "secondary"}>
              {menuItemDetails.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Image */}
            <Card className="md:col-span-2">
              <CardContent className="p-0">
                {menuItemDetails.imageUrl ? (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={menuItemDetails.imageUrl}
                      alt={menuItemDetails.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{menuItemDetails.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">${menuItemDetails.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preparation Time</span>
                  <span className="font-medium">{menuItemDetails.preparationTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Popularity</span>
                  <span className="font-medium">{menuItemDetails.popularity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">{menuItemDetails.reviews} / 5.0</span>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Dietary Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {menuItemDetails.dietary.map((diet) => (
                    <Badge key={diet} variant="outline">
                      {diet}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {menuItemDetails.ingredients.map((ingredient) => (
                    <div
                      key={ingredient}
                      className="rounded-md border px-3 py-2"
                    >
                      {ingredient}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nutritional Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Nutritional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">Calories</p>
                      <p className="text-2xl font-bold">
                        {menuItemDetails.nutritionalInfo.calories}
                        <span className="text-sm text-muted-foreground"> kcal</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">Protein</p>
                      <p className="text-2xl font-bold">
                        {menuItemDetails.nutritionalInfo.protein}
                        <span className="text-sm text-muted-foreground"> g</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">Carbs</p>
                      <p className="text-2xl font-bold">
                        {menuItemDetails.nutritionalInfo.carbs}
                        <span className="text-sm text-muted-foreground"> g</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">Fat</p>
                      <p className="text-2xl font-bold">
                        {menuItemDetails.nutritionalInfo.fat}
                        <span className="text-sm text-muted-foreground"> g</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 