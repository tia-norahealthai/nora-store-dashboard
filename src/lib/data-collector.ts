import { PageContextData, PageType } from '@/types/data-types'
import { supabase } from '@/lib/supabase'
import { fetchTableData } from './supabase-fetcher'
import { createClient } from '@/lib/supabase'
import { Customer } from '@/lib/types'

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

export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customers:', error)
      return []
    }

    return data || []
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
  const { data: customer, error } = await supabase
    .from('customers')
    .select(`
      *,
      orders:orders(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    return null
  }

  return customer
} 