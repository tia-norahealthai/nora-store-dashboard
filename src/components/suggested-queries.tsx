import { usePathname } from "next/navigation"
import { SuggestedQuery } from "./suggested-query"
import { SUGGESTED_QUERIES } from "@/config/suggested-queries"
import { CONTEXTUAL_QUERIES } from "@/config/contextual-queries"

interface SuggestedQueriesProps {
  onQuerySelect: (prompt: string) => void
}

export function SuggestedQueries({ onQuerySelect }: SuggestedQueriesProps) {
  const pathname = usePathname()
  
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

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {getContextualQueries().map((prompt) => (
        <SuggestedQuery
          key={prompt}
          prompt={prompt}
          onClick={() => onQuerySelect(prompt)}
        />
      ))}
    </div>
  )
} 