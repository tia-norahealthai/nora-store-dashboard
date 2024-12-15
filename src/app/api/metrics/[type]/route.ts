import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  const { type } = params
  const { restaurantId } = await request.json()

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    switch (type) {
      case 'revenue': {
        const { data: currentRevenue } = await supabase
          .from('orders')
          .select('order_items(quantity, menu_item(price))')
          .eq('restaurant_id', restaurantId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        const { data: previousRevenue } = await supabase
          .from('orders')
          .select('order_items(quantity, menu_item(price))')
          .eq('restaurant_id', restaurantId)
          .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
          .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        // Calculate revenues and trend
        const current = calculateRevenue(currentRevenue)
        const previous = calculateRevenue(previousRevenue)
        const percentChange = ((current - previous) / previous) * 100

        return NextResponse.json({
          value: current,
          trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral',
          trendValue: `${Math.abs(percentChange).toFixed(1)}% vs last month`
        })
      }

      case 'orders': {
        // Similar implementation for orders metric
        // ...
      }

      default:
        return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metric data' }, { status: 500 })
  }
}

function calculateRevenue(orders: any[]) {
  return orders?.reduce((sum, order) => 
    sum + (order.order_items?.reduce((itemSum: number, item: any) => 
      itemSum + (item.quantity * (item.menu_item?.price ?? 0)), 0) ?? 0
    ), 0) ?? 0
} 