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
import { DollarSign, FileText, User, Calendar, Receipt } from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"

// This would typically come from your API/database
const invoiceDetails = {
  id: "INV-2024-001",
  status: "paid", // paid, pending, overdue
  customer: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001"
  },
  items: [
    {
      id: "1",
      description: "Website Development",
      quantity: 1,
      rate: 2500.00,
      amount: 2500.00
    },
    {
      id: "2",
      description: "UI/UX Design",
      quantity: 1,
      rate: 1500.00,
      amount: 1500.00
    },
    {
      id: "3",
      description: "Content Creation",
      quantity: 10,
      rate: 100.00,
      amount: 1000.00
    }
  ],
  payment: {
    method: "Credit Card",
    subtotal: 5000.00,
    tax: 400.00,
    total: 5400.00
  },
  dates: {
    issued: "2024-03-20",
    due: "2024-04-20",
    paid: "2024-03-25"
  }
}

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
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
                  <BreadcrumbLink href="/invoices">Invoices</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{invoiceDetails.id}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Invoice Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Invoice {invoiceDetails.id}</h1>
              <p className="text-muted-foreground">
                Issued on {new Date(invoiceDetails.dates.issued).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={
              invoiceDetails.status === "paid" ? "success" : 
              invoiceDetails.status === "pending" ? "warning" : 
              "destructive"
            }>
              {invoiceDetails.status.charAt(0).toUpperCase() + invoiceDetails.status.slice(1)}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/avatars/${invoiceDetails.customer.avatar}.png`} />
                    <AvatarFallback>{invoiceDetails.customer.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{invoiceDetails.customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{invoiceDetails.customer.email}</p>
                    <p className="text-sm text-muted-foreground">{invoiceDetails.customer.phone}</p>
                    <p className="text-sm text-muted-foreground">{invoiceDetails.customer.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Invoice Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Issued Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoiceDetails.dates.issued).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoiceDetails.dates.due).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {invoiceDetails.dates.paid && (
                  <div className="flex items-center gap-4">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Paid Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoiceDetails.dates.paid).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoice Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {invoiceDetails.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.rate.toFixed(2)} per unit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${invoiceDetails.payment.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${invoiceDetails.payment.tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${invoiceDetails.payment.total.toFixed(2)}</span>
                  </div>
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