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
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LayoutGrid, LayoutList, Search } from "lucide-react"

interface DataTableProps<T> {
  data: T[]
  columns: {
    header: string
    accessorKey: string
    cell?: (item: T) => React.ReactNode
  }[]
  searchPlaceholder?: string
  searchKeys?: string[]
  gridViewRender?: (item: T) => React.ReactNode
  onRowClick?: (item: T) => void
  initialViewMode?: "grid" | "table"
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchKeys = [],
  gridViewRender,
  onRowClick,
  initialViewMode = "table",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">(initialViewMode)

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true
    return searchKeys.some((key) => {
      const value = key.split('.').reduce((obj, key) => obj?.[key], item)
      return String(value).toLowerCase().includes(searchQuery.toLowerCase())
    })
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {gridViewRender && (
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
        )}
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.accessorKey}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey}>
                      {column.cell
                        ? column.cell(item)
                        : column.accessorKey.split('.').reduce((obj, key) => obj?.[key], item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : gridViewRender ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((item) => gridViewRender(item))}
        </div>
      ) : null}
    </div>
  )
} 