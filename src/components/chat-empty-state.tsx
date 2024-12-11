import { MessagesSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function ChatEmptyState() {
  const router = useRouter()

  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <MessagesSquare className="h-10 w-10" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No conversations yet</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Start a new conversation to begin chatting with Maria.
        </p>
        <Button onClick={() => router.push("/maria")}>Start Conversation</Button>
      </div>
    </div>
  )
} 