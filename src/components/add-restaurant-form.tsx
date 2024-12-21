"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/supabase/db"
import { useToast } from "@/components/ui/use-toast"

const businessHoursSchema = z.object({
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
})

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  logo_url: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  cashback_percentage: z
    .number()
    .min(20, "Cashback must be at least 20%")
    .max(50, "Cashback cannot exceed 50%")
    .optional()
    .default(20),
  business_hours: z.object({
    monday: businessHoursSchema,
    tuesday: businessHoursSchema,
    wednesday: businessHoursSchema,
    thursday: businessHoursSchema,
    friday: businessHoursSchema,
    saturday: businessHoursSchema,
    sunday: businessHoursSchema,
  }),
})

type FormValues = z.infer<typeof formSchema>

const defaultBusinessHours = {
  open: "09:00",
  close: "22:00",
}

export function AddRestaurantForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      logo_url: "",
      business_hours: {
        monday: defaultBusinessHours,
        tuesday: defaultBusinessHours,
        wednesday: defaultBusinessHours,
        thursday: defaultBusinessHours,
        friday: defaultBusinessHours,
        saturday: defaultBusinessHours,
        sunday: defaultBusinessHours,
      },
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      await db.restaurants.create(data)
      toast({
        title: "Success",
        description: "Restaurant has been created successfully",
      })
      setOpen(false)
      form.reset()
      onSuccess()
    } catch (error) {
      console.error('Error creating restaurant:', error)
      toast({
        title: "Error",
        description: "Failed to create restaurant. Please try again.",
        variant: "destructive",
      })
    }
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Restaurant</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Restaurant</DialogTitle>
          <DialogDescription>
            Enter the details for the new restaurant location.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter restaurant name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter website URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter logo URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cashback_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cashback Percentage (20-50%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      min="20"
                      max="50"
                      placeholder="Enter cashback percentage (20-50)"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Business Hours</h3>
              {days.map((day) => (
                <div key={day} className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`business_hours.${day}.open` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{day} Open</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`business_hours.${day}.close` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{day} Close</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit">Create Restaurant</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 