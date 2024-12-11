import { usePathname } from "next/navigation"
import { SuggestedQuery } from "./suggested-query"
import { SUGGESTED_QUERIES } from "@/config/suggested-queries"
import { CONTEXTUAL_QUERIES } from "@/config/contextual-queries"
import { Button } from "@/components/ui/button"

interface SuggestedQueriesProps {
  onQuerySelect: (query: string) => void
}

export function SuggestedQueries({ onQuerySelect }: SuggestedQueriesProps) {
  const pathname = usePathname() || ""
  
  const getContextualQueries = () => {
    // Handle root path (dashboard)
    if (pathname === "/") {
      return CONTEXTUAL_QUERIES[""]
    }
    
    // Handle meal item details page
    if (pathname.startsWith("/menu/")) {
      return CONTEXTUAL_QUERIES["menu/[id]"]
    }

    // Extract the base path for other routes
    const basePath = pathname.split("/")[1]
    return CONTEXTUAL_QUERIES[basePath as keyof typeof CONTEXTUAL_QUERIES] || SUGGESTED_QUERIES
  }

  const queries = [
    {
      title: "Add Menu Item",
      query: `Create menu item with:
- name: 'Margherita Pizza'
- price: 12.99
- category: 'Pizza'
- description: 'Classic Italian pizza with fresh tomatoes and mozzarella'`
    },
    {
      title: "Update Menu Item",
      query: "Update menu item"
    },
    {
      title: "Delete Menu Item",
      query: "Delete menu item"
    }
  ]

  return (
    <div className="grid gap-2">
      <p className="text-sm text-muted-foreground">Suggested queries:</p>
      <div className="flex flex-wrap gap-2">
        {queries.map((item) => (
          <Button
            key={item.title}
            variant="outline"
            size="sm"
            onClick={() => onQuerySelect(item.query)}
          >
            {item.title}
          </Button>
        ))}
      </div>
    </div>
  )
} 