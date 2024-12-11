import { Button } from "@/components/ui/button"

interface SuggestedQueryProps {
  prompt: string
  onClick?: () => void
}

export function SuggestedQuery({ prompt, onClick }: SuggestedQueryProps) {
  return (
    <Button
      variant="outline"
      className="text-sm text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      {prompt}
    </Button>
  )
} 