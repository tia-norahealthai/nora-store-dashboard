import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

interface SignupRequest {
  email: string
  password: string
  full_name: string
  restaurant_name: string
  restaurant_address: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      full_name,
      restaurant_name, 
      restaurant_address
    } = body as SignupRequest
    
    // Validate required fields
    if (!email || !password || !restaurant_name || !restaurant_address) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create user account
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 400 }
      )
    }

    if (!userData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create a service role client for restaurant creation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create restaurant using admin client
    const { error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .insert([{
        name: restaurant_name,
        address: restaurant_address,
        created_by: userData.user.id
      }])

    if (restaurantError) {
      console.error('Error creating restaurant:', restaurantError)
      
      // Clean up the user account if restaurant creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      
      return NextResponse.json(
        { error: 'Failed to create restaurant' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: userData.user,
      session: userData.session,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
} 