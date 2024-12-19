import { db } from '@/lib/supabase/db'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type QueryResult = {
  response: string
  data?: any
}

export async function handleDatabaseQuery(query: string): Promise<QueryResult> {
  const normalizedQuery = query.toLowerCase()
  
  try {
    // Order amount queries
    const amountMatch = normalizedQuery.match(/orders? (over|above|greater than|more than|under|below|less than) \$?(\d+)/)
    if (amountMatch) {
      const [_, comparison, amount] = amountMatch
      const isGreaterThan = ['over', 'above', 'greater than', 'more than'].includes(comparison)
      const numericAmount = parseFloat(amount)

      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, created_at')
        .gte('total_amount', isGreaterThan ? numericAmount : 0)
        .lte('total_amount', isGreaterThan ? 9999999 : numericAmount)
        .order('total_amount', { ascending: false })

      const orderCount = orders?.length || 0
      const formattedOrders = orders?.map(order => ({
        ...order,
        total_amount: `$${order.total_amount.toFixed(2)}`,
        created_at: new Date(order.created_at).toLocaleDateString()
      }))

      return {
        response: `There ${orderCount === 1 ? 'is' : 'are'} ${orderCount} order${orderCount === 1 ? '' : 's'} ${comparison} $${numericAmount}.\n\n${
          orderCount > 0 
            ? `Here are the details:\n${formattedOrders?.map(order => 
                `Order #${order.id}: ${order.total_amount} (${order.created_at})`
              ).join('\n')}`
            : ''
        }`,
        data: { orders: formattedOrders, count: orderCount }
      }
    }

    // Customer-related queries
    if (normalizedQuery.includes('how many customers') || normalizedQuery.includes('total customers')) {
      const count = await db.customers.getCount()
      return {
        response: `We have a total of ${count} customers.`,
        data: { customerCount: count }
      }
    }

    if (normalizedQuery.includes('active customers')) {
      const count = await db.customers.getActiveCount()
      return {
        response: `There are ${count} active customers.`,
        data: { activeCustomerCount: count }
      }
    }

    // Menu-related queries
    if (normalizedQuery.includes('menu items') || normalizedQuery.includes('dishes')) {
      const items = await db.menu.getItems()
      const categories = [...new Set(items.map(item => item.category).filter(Boolean))]
      
      return {
        response: `We have ${items.length} menu items across ${categories.length} categories: ${categories.join(', ')}.`,
        data: { menuItems: items, categories }
      }
    }

    // Order-related queries
    if (normalizedQuery.includes('pending orders') || normalizedQuery.includes('active orders')) {
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
      
      return {
        response: `There are ${orders?.length || 0} pending orders.`,
        data: { pendingOrders: orders }
      }
    }

    if (normalizedQuery.includes('total orders') || normalizedQuery.includes('all orders')) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
      
      return {
        response: `The total number of orders is ${count || 0}.`,
        data: { totalOrders: count }
      }
    }

    // Revenue-related queries
    if (normalizedQuery.includes('revenue') || normalizedQuery.includes('sales')) {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
      
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      return {
        response: `The total revenue is $${totalRevenue.toFixed(2)}.`,
        data: { revenue: totalRevenue }
      }
    }

    return {
      response: "I'm not sure how to answer that question about the database. Could you please rephrase it or ask something about customers, menu items, orders, or revenue?",
    }
  } catch (error) {
    console.error('Database query error:', error)
    return {
      response: "I apologize, but I encountered an error while trying to fetch that information. Please try again or contact support if the issue persists.",
    }
  }
} 