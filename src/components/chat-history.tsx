"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChatEmptyState } from "@/components/chat-empty-state"
import { mockConversations } from '@/lib/mock-chat-data'

// Transform mock data to match the table display format
const transformedSessions = mockConversations.map(conv => ({
  id: conv.id,
  title: conv.title,
  preview: conv.messages[0].content,
  date: conv.updatedAt,
  messageCount: conv.messages.length,
  topics: ['React', 'TypeScript'] // Adding mock topics for demonstration
}))

export function ChatHistory() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sessions, setSessions] = useState(transformedSessions)

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions(sessions.filter(session => session.id !== sessionId))
  }

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleViewChat = (sessionId: string) => {
    router.push(`/vittoria/history/${sessionId}`)
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ChatEmptyState />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conversation</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No conversations found
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions.map((session) => (
                <TableRow
                  key={session.id}
                  className="cursor-pointer"
                  onClick={() => handleViewChat(session.id)}
                >
                  <TableCell className="font-medium">{session.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {session.preview}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {session.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{session.messageCount}</TableCell>
                  <TableCell>
                    {new Date(session.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => handleDeleteSession(session.id, e)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 