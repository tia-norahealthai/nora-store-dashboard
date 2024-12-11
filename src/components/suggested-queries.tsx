import { SuggestedQuery } from "./suggested-query"
import { SUGGESTED_QUERIES } from "@/config/suggested-queries"

interface SuggestedQueriesProps {
  onQuerySelect: (prompt: string) => void
}

export function SuggestedQueries({ onQuerySelect }: SuggestedQueriesProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      {SUGGESTED_QUERIES.map((prompt) => (
        <SuggestedQuery 
          key={prompt} 
          prompt={prompt} 
          onClick={() => onQuerySelect(prompt)}
        />
      ))}
    </div>
  )
} 