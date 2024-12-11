import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// This client should only be used in Client Components
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  )
}

// Create a singleton instance for client-side operations
export const supabase = createBrowserClient() 