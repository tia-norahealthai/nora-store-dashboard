import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)

      // Get the user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get the user's restaurant
        const { data: userRestaurant } = await supabase
          .from('restaurant_users')
          .select(`
            restaurant:restaurants (
              id,
              cashback_percentage,
              address,
              phone,
              business_hours
            )
          `)
          .eq('user_id', user.id)
          .single()

        // Check if setup is completed
        if (userRestaurant?.restaurant) {
          const restaurant = userRestaurant.restaurant
          const isSetupComplete = Boolean(
            restaurant.address &&
            restaurant.phone &&
            restaurant.business_hours &&
            restaurant.cashback_percentage !== null
          )

          if (!isSetupComplete) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
          }
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error)
    }
  }

  // Default redirect to dashboard if everything is set up
  return NextResponse.redirect(new URL('/dashboard', request.url))
} 