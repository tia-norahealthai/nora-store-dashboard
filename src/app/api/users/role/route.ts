import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json()
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

    // Update user's role
    const { error } = await supabase
      .rpc('manage_user_role', {
        target_user_id: userId,
        new_role: role
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error managing role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
} 