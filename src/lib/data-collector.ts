import { PageContextData, PageType } from '@/types/data-types'

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