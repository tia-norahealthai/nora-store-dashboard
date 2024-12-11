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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
  reviews: 4.8,
  allergens: ["Dairy", "Gluten", "Wheat"],
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
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {menuItemDetails.imageUrl ? (
                  <AvatarImage src={menuItemDetails.imageUrl} alt={menuItemDetails.name} />
                ) : (
                  <AvatarFallback>
                    <UtensilsCrossed className="h-6 w-6" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{menuItemDetails.name}</h1>
                <p className="text-muted-foreground">{menuItemDetails.description}</p>
              </div>
            </div>
            <Badge variant={menuItemDetails.status === "available" ? "success" : "secondary"}>
              {menuItemDetails.status.replace("_", " ")}
            </Badge>
          </div>

          {/* Bento Box Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]">
            {/* Featured Image - Spans 2 columns and rows */}
            <Card className="md:col-span-2 md:row-span-2">
              <CardContent className="p-0 h-full">
                {menuItemDetails.imageUrl ? (
                  <div className="h-full w-full overflow-hidden rounded-lg">
                    <img
                      src={menuItemDetails.imageUrl}
                      alt={menuItemDetails.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price and Rating - Spans 2 columns */}
            <Card className="md:col-span-2">
              <CardContent className="flex items-center justify-between h-full">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold">${menuItemDetails.price.toFixed(2)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-3xl font-bold">{menuItemDetails.reviews}</p>
                  <p className="text-sm text-muted-foreground">/ 5.0</p>
                </div>
              </CardContent>
            </Card>

            {/* Preparation Time */}
            <Card>
              <CardContent className="flex flex-col justify-center h-full space-y-1">
                <p className="text-sm text-muted-foreground">Prep Time</p>
                <p className="text-lg font-medium">{menuItemDetails.preparationTime}</p>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardContent className="flex flex-col justify-center h-full space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-lg font-medium">{menuItemDetails.category}</p>
              </CardContent>
            </Card>

            {/* Dietary Information - Spans 2 columns */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4" />
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

            {/* Allergens - Spans 2 columns */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4" />
                  Allergens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {menuItemDetails.allergens.map((allergen) => (
                    <Badge key={allergen} variant="destructive">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nutritional Info - Spans full width */}
            <Card className="md:col-span-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Nutritional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(menuItemDetails.nutritionalInfo).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4 rounded-lg border p-4">
                      <div>
                        <p className="text-sm font-medium capitalize">{key}</p>
                        <p className="text-2xl font-bold">
                          {value}
                          <span className="text-sm text-muted-foreground">
                            {key === 'calories' ? ' kcal' : ' g'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ingredients - Spans full width */}
            <Card className="md:col-span-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 