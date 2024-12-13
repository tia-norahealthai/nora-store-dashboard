"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { processMenuItemsCsv } from '@/lib/csv-utils'
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle } from "lucide-react"

export function CsvUpload() {
  const [isLoading, setIsLoading] = useState(false)
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  })
  const { toast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const result = await processMenuItemsCsv(file)
      
      if (result.success) {
        setDialog({
          isOpen: true,
          type: 'success',
          title: "Upload Successful",
          message: `${result.message}\n\nYour menu items have been successfully added to the database. The page will refresh when you close this dialog.`
        })
      } else {
        setDialog({
          isOpen: true,
          type: 'error',
          title: "CSV Upload Error",
          message: result.message
        })
      }
    } catch (error) {
      console.error('Error uploading CSV:', error)
      setDialog({
        isOpen: true,
        type: 'error',
        title: "Upload Failed",
        message: "There was an error processing your CSV file. Please ensure it matches the required format and try again.\n\n" +
                "Required columns: name, price, category, restaurant_id\n" +
                "See template for all available columns."
      })
    } finally {
      setIsLoading(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }))
    if (dialog.type === 'success') {
      window.location.reload()
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isLoading}
          className="max-w-[300px]"
        />
        {isLoading && <span className="text-sm text-muted-foreground">Processing...</span>}
      </div>

      <Dialog open={dialog.isOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={dialog.type === 'success' ? "text-green-600" : "text-destructive"}>
              <div className="flex items-center gap-2">
                {dialog.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                {dialog.title}
              </div>
            </DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {dialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {dialog.type === 'success' ? 'Close & Refresh' : 'Close'}
            </Button>
            {dialog.type === 'error' && (
              <Button
                variant="secondary"
                onClick={() => {
                  // Download sample CSV template
                  const csvContent = [
                    // Headers
                    "restaurant_id,name,description,price,type,cuisine_type,category,average_rating,calories,carbohydrates,protein,fat,added_sugars,processed_food,ingredients,dressing,food_benefits,allergens,healthy_score,image_url,availability",
                    // Sample row 1
                    `123e4567-e89b-12d3-a456-426614174000,Grilled Salmon Bowl,Fresh grilled salmon with quinoa and vegetables,16.99,main,seafood,Bowls,4.5,450,45,35,15,0,false,"salmon,quinoa,broccoli,carrots",lemon vinaigrette,"omega-3,protein,vitamins","fish,sesame",85,https://example.com/salmon.jpg,available`,
                    // Sample row 2
                    `123e4567-e89b-12d3-a456-426614174000,Quinoa Buddha Bowl,Nutrient-rich vegetarian bowl,14.99,main,vegetarian,Bowls,4.8,380,48,12,18,2,false,"quinoa,chickpeas,sweet potato,kale",tahini,"fiber,protein,iron","sesame,nuts",90,https://example.com/buddha-bowl.jpg,available`
                  ].join('\n')

                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'menu_items_template.csv'
                  a.click()
                  window.URL.revokeObjectURL(url)
                }}
              >
                Download Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 