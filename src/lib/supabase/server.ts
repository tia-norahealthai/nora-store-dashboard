import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { type Database } from '@/types/supabase'

// This client should only be used in Server Components or API routes
export function createServerClient(cookieStore?: ReturnType<typeof cookies>) {
  // Only try to get cookies if we're in a request context
  const cookieHeader = cookieStore?.getAll()?.reduce((acc, cookie) => {
    return `${acc}${cookie.name}=${cookie.value}; `
  }, '') || ''

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          cookie: cookieHeader,
        },
      },
    }
  )
}

// Create a singleton instance for server-side operations
export const supabaseAdmin = createServerClient() 