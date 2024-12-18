import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify the caller is an admin
    const { data: isAdmin, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Assign admin role
    const { error } = await supabase
      .rpc('assign_admin_role', {
        target_user_id: userId
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error assigning admin role:', error)
    return NextResponse.json(
      { error: 'Failed to assign admin role' },
      { status: 500 }
    )
  }
} 