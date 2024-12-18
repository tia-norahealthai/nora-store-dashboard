import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function assignUserRole(userId: string, role: 'admin' | 'business_owner') {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { error } = await supabase
      .rpc('assign_role', {
        target_user_id: userId,
        role_name: role
      })
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error assigning role:', error)
    return false
  }
} 