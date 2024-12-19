"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { MenuItem } from "@/lib/types"
import { MenuItemCard } from "@/components/menu-item-card"
import Image from "next/image"

interface MenuTableProps {
  items: MenuItem[]
  initialViewMode?: "grid" | "table"
}

const getValidImageUrl = (url?: string) => {
  if (!url) return '/images/placeholder-dish.jpg'
  
  // If it's a relative URL starting with /, return as is
  if (url.startsWith('/')) {
    return url
  }

  // If it's a data URL, return as is
  if (url.startsWith('data:')) {
    return url
  }

  // List of allowed domains
  const allowedDomains = [
    'xyhqystoebgvqjqgmqng.supabase.co',
    'images.unsplash.com',
    'images.squarespace-cdn.com',
    'xtra-static-content.s3.us-east-1.amazonaws.com'
  ]

  try {
    // Add https:// if the URL doesn't start with http:// or https://
    const urlToCheck = url.match(/^https?:\/\//) ? url : `https://${url}`
    const urlObj = new URL(urlToCheck)
    
    if (allowedDomains.includes(urlObj.hostname)) {
      return urlToCheck
    }
    
    console.warn(`Image domain not allowed: ${urlObj.hostname}`)
    return '/images/placeholder-dish.jpg'
  } catch (error) {
    console.warn('Invalid image URL:', url)
    return '/images/placeholder-dish.jpg'
  }
}

export function MenuTable({ items, initialViewMode = "grid" }: MenuTableProps) {
  const router = useRouter()

  const columns = [
    {
      header: "",
      accessorKey: "image_url",
      cell: (item: MenuItem) => (
        <div className="relative h-10 w-10 rounded-md overflow-hidden">
          <Image
            src={getValidImageUrl(item.image_url)}
            alt={item.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (item: MenuItem) => (
        <div className="font-medium">{item.name}</div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (item: MenuItem) => (
        item.category && (
          <Badge variant="secondary">
            {item.category}
          </Badge>
        )
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (item: MenuItem) => (
        <div className="text-right">${item.price.toFixed(2)}</div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: MenuItem) => (
        <Badge variant={item.status === "active" ? "success" : "secondary"}>
          {item.status || 'active'}
        </Badge>
      ),
    },
  ]

  return (
    <DataTable
      data={items}
      columns={columns}
      searchPlaceholder="Search menu items..."
      searchKeys={["name", "description", "category"]}
      gridViewRender={(item) => <MenuItemCard key={item.id} item={item} />}
      onRowClick={(item) => router.push(`/menu/${item.id}`)}
      initialViewMode={initialViewMode}
    />
  )
} 