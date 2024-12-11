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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Star, User, Calendar, Package } from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"

// This would typically come from your API/database
const feedbackDetails = {
  id: "FB-2024-001",
  rating: 4,
  comment: "Great food and excellent service! The pizza was perfectly cooked and arrived hot. Will definitely order again.",
  status: "published", // published, pending, archived
  customer: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
    orderCount: 15
  },
  order: {
    id: "ORD-2024-001",
    items: ["Margherita Pizza", "Garlic Bread", "Coke"],
    total: 32.50,
    date: "2024-03-20T18:30:00Z"
  },
  createdAt: "2024-03-20T19:15:00Z",
  updatedAt: "2024-03-20T19:15:00Z"
}

export default function FeedbackDetailsPage({ params }: { params: { id: string } }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
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
                  <BreadcrumbLink href="/feedbacks">Feedbacks</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{feedbackDetails.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Feedback Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Feedback {feedbackDetails.id}</h1>
              <p className="text-muted-foreground">
                Submitted on {new Date(feedbackDetails.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge variant={
              feedbackDetails.status === "published" ? "success" : 
              feedbackDetails.status === "pending" ? "warning" : 
              "secondary"
            }>
              {feedbackDetails.status.charAt(0).toUpperCase() + feedbackDetails.status.slice(1)}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/avatars/${feedbackDetails.customer.avatar}.png`} />
                    <AvatarFallback>{feedbackDetails.customer.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{feedbackDetails.customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{feedbackDetails.customer.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {feedbackDetails.customer.orderCount} orders placed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Order ID</p>
                    <p className="text-muted-foreground">{feedbackDetails.order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Items</p>
                    <p className="text-muted-foreground">
                      {feedbackDetails.order.items.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-muted-foreground">
                      ${feedbackDetails.order.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order Date</p>
                    <p className="text-muted-foreground">
                      {new Date(feedbackDetails.order.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Content */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < feedbackDetails.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {feedbackDetails.rating} out of 5
                    </span>
                  </div>
                  <p className="text-lg">{feedbackDetails.comment}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
      <ChatSidebar />
    </SidebarProvider>
  )
} 