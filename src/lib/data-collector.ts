import { PageContextData, PageType } from '@/types/data-types'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/supabase'

function parseDataAttributes(element: Element): Record<string, any> {
  return Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('data-'))
    .reduce((acc, attr) => ({
      ...acc,
      [attr.name.replace('data-', '')]: attr.value
    }), {})
}

export function collectPageData(type: PageType): PageContextData[PageType] | null {
  try {
    switch (type) {
      case 'menu_details': {
        const menuItem = document.querySelector('[data-menu-item]')
        if (!menuItem) return null

        const data = parseDataAttributes(menuItem)
        return {
          item: {
            id: data.id,
            name: data.name,
            price: parseFloat(data.price),
            description: data.description,
            category: data.category,
            dietary: data.dietary?.split(',') || [],
            allergens: data.allergens?.split(','),
            status: data.status as 'available' | 'out_of_stock' | 'coming_soon',
            nutritionalInfo: data['nutritional-info'] ? JSON.parse(data['nutritional-info']) : undefined,
            ingredients: data.ingredients?.split(','),
            preparationTime: data['preparation-time']
          }
        }
      }

      case 'customer_details': {
        const customer = document.querySelector('[data-customer]')
        if (!customer) return null

        const data = parseDataAttributes(customer)
        return {
          customer: {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            dietaryPreference: data['dietary-preference'],
            allergens: data.allergens?.split(','),
            totalOrders: parseInt(data['total-orders']),
            totalSpent: parseFloat(data['total-spent'])
          }
        }
      }

      case 'order_details': {
        const order = document.querySelector('[data-order]')
        if (!order) return null

        const data = parseDataAttributes(order)
        const items = Array.from(document.querySelectorAll('[data-order-item]'))
          .map(item => {
            const itemData = parseDataAttributes(item)
            return {
              name: itemData.name,
              quantity: parseInt(itemData.quantity),
              price: parseFloat(itemData.price),
              notes: itemData.notes
            }
          })

        return {
          order: {
            id: data.id,
            status: data.status,
            items,
            payment: data.payment ? JSON.parse(data.payment) : undefined,
            timestamps: data.timestamps ? JSON.parse(data.timestamps) : undefined
          }
        }
      }

      case 'dashboard': {
        const metrics = document.querySelector('[data-metrics]')
        if (!metrics) return null

        const data = parseDataAttributes(metrics)
        return {
          metrics: {
            revenue: parseFloat(data.revenue),
            activeUsers: parseInt(data['active-users']),
            conversionRate: parseFloat(data['conversion-rate']),
            pendingOrders: parseInt(data['pending-orders']),
            totalOrders: parseInt(data['total-orders'])
          }
        }
      }

      default:
        return null
    }
  } catch (error) {
    console.error('Error collecting page data:', error)
    return null
  }
}

// Add this function to test the connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('menu_items').select('count');
    if (error) {
      console.error('Supabase connection test error:', error);
      return false;
    }
    console.log('Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}

export async function getMenuItems() {
  try {
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Supabase');
    }

    console.log('Fetching menu items...');
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price,
        category,
        image_url,
        status,
        ingredients,
        nutritional_info,
        preparation_time
      `);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Log the exact structure of the data
    console.log('Menu items structure:', {
      count: menuItems?.length,
      firstItem: menuItems?.[0],
    });
    
    return menuItems || [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
}

// Define interfaces for type safety
interface CustomerWithOrders {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  created_at: string
  orders?: Array<{
    id: string
  }>
  total_orders?: number
}

export async function getCustomers(): Promise<CustomerWithOrders[]> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore
    })

    // Fetch customers with their orders
    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        *,
        orders!customer_id(id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customers:', error)
      return []
    }

    // Transform the data to include the order count
    return (customers || []).map((customer: CustomerWithOrders) => ({
      ...customer,
      total_orders: Array.isArray(customer.orders) ? customer.orders.length : 0
    }))

  } catch (error) {
    console.error('Unexpected error fetching customers:', error)
    return []
  }
}

export async function getOrders() {
  return fetchTableData('orders', `
    id,
    customer_id,
    status,
    total,
    created_at,
    items,
    payment_method
  `, {
    orderBy: 'created_at.desc'
  })
}

export async function getFeedbacks() {
  return fetchTableData('feedbacks', `
    id,
    customer_id,
    rating,
    comment,
    status,
    created_at,
    order_id
  `, {
    orderBy: 'created_at.desc'
  })
}

export async function getInvoices() {
  return fetchTableData('invoices', `
    id,
    invoice_number,
    customer_id,
    status,
    amount,
    created_at
  `, {
    orderBy: 'created_at.desc'
  })
}

export async function getCustomerById(id: string) {
  if (!id) {
    throw new Error('Customer ID is required')
  }

  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore
    })

    // First verify if the customer exists
    const { data: customerExists, error: existsError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', id)
      .single()

    if (existsError || !customerExists) {
      throw new Error('Customer not found')
    }

    // Then fetch the full customer data with relations
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        email,
        phone,
        created_at,
        dietary_preferences,
        allergens,
        drinks_budget,
        meals_budget,
        snacks_budget,
        orders:orders!customer_id (
          id,
          status,
          created_at,
          total_amount,
          order_items:order_items!order_id (
            id,
            quantity,
            menu_items:menu_items!menu_item_id (
              name,
              price
            )
          )
        ),
        meal_plans:meal_plans!customer_id (
          id,
          status,
          start_date,
          end_date,
          created_at,
          meal_plan_items:meal_plan_items!meal_plan_id (
            id,
            day,
            daytime,
            menu_item_id,
            menu_items:menu_items!menu_item_id (
              id,
              name,
              price,
              description,
              category
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to fetch customer: ${error.message}`)
    }

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Ensure arrays exist before mapping
    const orders = Array.isArray(customer.orders) ? customer.orders : []
    const mealPlans = Array.isArray(customer.meal_plans) ? customer.meal_plans : []

    // Transform the data to match expected structure
    const transformedCustomer = {
      ...customer,
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        created_at: order.created_at,
        total_amount: order.total_amount,
        order_items: Array.isArray(order.order_items) 
          ? order.order_items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              item_name: item.menu_items?.name || '',
              price: item.menu_items?.price || 0
            }))
          : []
      })),
      meal_plans: mealPlans.map(plan => ({
        id: plan.id,
        status: plan.status,
        start_date: plan.start_date,
        end_date: plan.end_date,
        created_at: plan.created_at,
        meal_plan_items: Array.isArray(plan.meal_plan_items)
          ? plan.meal_plan_items.map(item => ({
              id: item.id,
              day: item.day,
              daytime: item.daytime,
              menu_item: item.menu_items
            }))
          : []
      }))
    }

    return transformedCustomer

  } catch (error) {
    console.error('Error fetching customer:', error)
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Failed to load customer data')
  }
}

export async function getCustomerMetrics() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore
    })

    // Get current date and first day of current month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    // Get total customers and new customers this month
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('id, created_at')

    if (customersError) {
      console.error('Error fetching customers data:', customersError)
      throw customersError
    }

    const totalCustomers = customersData?.length || 0
    const newCustomers = customersData?.filter((customer: { created_at: string }) => 
      new Date(customer.created_at) >= firstDayOfMonth
    ).length || 0

    // Get orders data for this month and last month with their items
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        customer_id,
        order_items!order_id (
          quantity,
          menu_items!menu_item_id (
            price
          )
        )
      `)
      .gte('created_at', firstDayOfLastMonth.toISOString())

    if (ordersError) {
      console.error('Error fetching orders data:', ordersError)
      throw ordersError
    }

    interface OrderData {
      created_at: string
      order_items?: Array<{
        quantity: number
        menu_items: {
          price: number
        }
      }>
    }

    // Calculate orders metrics
    const thisMonthOrders = ordersData?.filter((order: OrderData) => 
      new Date(order.created_at) >= firstDayOfMonth
    ) || []
    
    const lastMonthOrders = ordersData?.filter((order: OrderData) => 
      new Date(order.created_at) >= firstDayOfLastMonth && 
      new Date(order.created_at) < firstDayOfMonth
    ) || []

    const monthlyOrders = thisMonthOrders.length
    const ordersTrend = lastMonthOrders.length 
      ? ((monthlyOrders - lastMonthOrders.length) / lastMonthOrders.length * 100).toFixed(1)
      : 0

    // Calculate total amount for each order
    const getOrderTotal = (order: OrderData): number => {
      if (!order.order_items || !Array.isArray(order.order_items)) return 0
      return order.order_items.reduce((sum: number, item) => {
        const quantity = item.quantity || 0
        const price = item.menu_items?.price || 0
        return sum + (quantity * price)
      }, 0)
    }

    const thisMonthTotal = thisMonthOrders.reduce((sum: number, order) => 
      sum + getOrderTotal(order), 0)
    const lastMonthTotal = lastMonthOrders.reduce((sum: number, order) => 
      sum + getOrderTotal(order), 0)

    // Calculate average order value
    const averageOrderValue = thisMonthOrders.length 
      ? Math.round(thisMonthTotal / thisMonthOrders.length) 
      : 0
    const lastMonthAverage = lastMonthOrders.length 
      ? lastMonthTotal / lastMonthOrders.length 
      : 0
    const orderValueTrend = lastMonthAverage 
      ? ((averageOrderValue - lastMonthAverage) / lastMonthAverage * 100).toFixed(1)
      : 0

    // Calculate retention rate
    const thisMonthCustomers = new Set(thisMonthOrders.map(o => o.customer_id))
    const lastMonthCustomers = new Set(lastMonthOrders.map(o => o.customer_id))
    const repeatCustomers = Array.from(thisMonthCustomers).filter(id => lastMonthCustomers.has(id))
    
    const retentionRate = lastMonthCustomers.size 
      ? Math.round((repeatCustomers.length / lastMonthCustomers.size) * 100)
      : 0

    return {
      totalCustomers,
      newCustomers,
      averageOrderValue,
      orderValueTrend: Number(orderValueTrend),
      retentionRate,
      retentionTrend: 0,
      monthlyOrders,
      ordersTrend: Number(ordersTrend)
    }
  } catch (error) {
    console.error('Error fetching customer metrics:', error)
    return {
      totalCustomers: 0,
      newCustomers: 0,
      averageOrderValue: 0,
      orderValueTrend: 0,
      retentionRate: 0,
      retentionTrend: 0,
      monthlyOrders: 0,
      ordersTrend: 0
    }
  }
}