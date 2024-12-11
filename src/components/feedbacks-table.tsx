"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, Star, LayoutGrid, LayoutList } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type Feedback = {
  id: string
  customer: {
    name: string
    email: string
    avatarUrl?: string
  }
  rating: number
  comment: string
  category: "food" | "service" | "ambiance" | "delivery" | "other"
  status: "new" | "reviewed" | "addressed" | "archived"
  date: string
  orderNumber?: string
}

// This would typically come from your API/database
const mockFeedbacks: Feedback[] = [
  {
    id: "1",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatarUrl: "/avatars/01.png"
    },
    rating: 4,
    comment: "The food was delicious! Delivery was a bit delayed though.",
    category: "food",
    status: "new",
    date: "2024-03-20",
    orderNumber: "ORD-2024-001"
  },
  {
    id: "2",
    customer: {
      name: "Michael Chen",
      email: "m.chen@example.com",
      avatarUrl: "/avatars/02.png"
    },
    rating: 5,
    comment: "Outstanding service and the food was perfect!",
    category: "service",
    status: "reviewed",
    date: "2024-03-19",
    orderNumber: "ORD-2024-002"
  },
  {
    id: "3",
    customer: {
      name: "Emma Wilson",
      email: "emma.w@example.com",
      avatarUrl: "/avatars/03.png"
    },
    rating: 3,
    comment: "The ambiance could be improved, but food was good.",
    category: "ambiance",
    status: "addressed",
    date: "2024-03-18",
    orderNumber: "ORD-2024-003"
  }
]

const getStatusBadgeVariant = (status: Feedback["status"]) => {
  switch (status) {
    case "new":
      return "default"
    case "reviewed":
      return "secondary"
    case "addressed":
      return "success"
    case "archived":
      return "outline"
    default:
      return "default"
  }
}

export function FeedbacksTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const itemsPerPage = viewMode === "grid" ? 12 : 10

  const filteredFeedbacks = mockFeedbacks.filter(feedback =>
    feedback.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Customer Feedback</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setViewMode("table")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFeedbacks.map((feedback) => (
              <TableRow key={feedback.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={feedback.customer.avatarUrl} alt={feedback.customer.name} />
                      <AvatarFallback>
                        {feedback.customer.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{feedback.customer.name}</span>
                      <span className="text-xs text-muted-foreground">{feedback.customer.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < feedback.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="truncate">{feedback.comment}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {feedback.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(feedback.status)} className="capitalize">
                    {feedback.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(feedback.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Update status</DropdownMenuItem>
                      <DropdownMenuItem>View order</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Archive feedback
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedFeedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={feedback.customer.avatarUrl} alt={feedback.customer.name} />
                  <AvatarFallback>
                    {feedback.customer.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{feedback.customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{feedback.customer.email}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Update status</DropdownMenuItem>
                        <DropdownMenuItem>View order</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Archive feedback
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < feedback.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {feedback.comment}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className="capitalize">
                    {feedback.category}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(feedback.status)} className="capitalize">
                    {feedback.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{new Date(feedback.date).toLocaleDateString()}</span>
                  {feedback.orderNumber && (
                    <span className="font-mono">{feedback.orderNumber}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFeedbacks.length)} of{" "}
          {filteredFeedbacks.length} feedbacks
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