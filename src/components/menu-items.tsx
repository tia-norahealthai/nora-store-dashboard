"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MoreHorizontal, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter
} from "lucide-react"

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  dietary: string[]
  status: "available" | "out_of_stock" | "coming_soon"
  imageUrl?: string
}

// This would typically come from your API/database
const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, basil, and olive oil",
    price: 14.99,
    category: "Pizza",
    dietary: ["vegetarian"],
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "Chicken Tikka Masala",
    description: "Grilled chicken in spiced curry sauce with rice",
    price: 16.99,
    category: "Main Course",
    dietary: ["gluten-free"],
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop"
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Romaine lettuce, croutons, parmesan, caesar dressing",
    price: 10.99,
    category: "Salads",
    dietary: ["vegetarian"],
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&auto=format&fit=crop"
  },
  {
    id: "4",
    name: "Vegan Buddha Bowl",
    description: "Quinoa, roasted vegetables, avocado, tahini dressing",
    price: 15.99,
    category: "Main Course",
    dietary: ["vegan", "gluten-free"],
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop"
  },
  {
    id: "5",
    name: "Seasonal Special",
    description: "Chef's special seasonal dish",
    price: 24.99,
    category: "Specials",
    dietary: [],
    status: "coming_soon",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop"
  }
]

const categories = ["All", "Pizza", "Main Course", "Salads", "Specials"]
const dietaryFilters = ["vegetarian", "vegan", "gluten-free"]

export function MenuItems() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const filteredItems = mockMenuItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === "All" || item.category === selectedCategory
    
    const matchesDietary = 
      selectedDietary.length === 0 || 
      selectedDietary.every(diet => item.dietary.includes(diet))

    return matchesSearch && matchesCategory && matchesDietary
  })

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadgeVariant = (status: MenuItem["status"]) => {
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

  const handleViewDetails = (id: string) => {
    router.push(`/menu/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Menu Items</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Category: {selectedCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Dietary ({selectedDietary.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {dietaryFilters.map((diet) => (
                  <DropdownMenuItem 
                    key={diet}
                    onClick={() => {
                      setSelectedDietary(prev => 
                        prev.includes(diet)
                          ? prev.filter(d => d !== diet)
                          : [...prev, diet]
                      )
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDietary.includes(diet)}
                      className="mr-2"
                      readOnly
                    />
                    {diet}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedItems.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden cursor-pointer"
            onClick={() => handleViewDetails(item.id)}
          >
            {item.imageUrl && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            )}
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(item.id)
                    }}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      Edit item
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      Update status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge variant={getStatusBadgeVariant(item.status)}>
                {item.status.replace("_", " ")}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {item.dietary.map((diet) => (
                  <Badge key={diet} variant="outline">
                    {diet}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {item.category}
                </span>
                <span className="font-semibold">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of{" "}
          {filteredItems.length} items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 