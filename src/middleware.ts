import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/reset-password', '/signup']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Handle public routes
  if (PUBLIC_ROUTES.includes(req.nextUrl.pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return res
  }

  // Require authentication for all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Check if user has permission to access the requested route
  const { data: permissions } = await supabase
    .from('role_permissions')
    .select('resource')
    .eq('role', 'business_owner')

  const allowedPaths = permissions?.map(p => p.resource) || []
  const requestedPath = req.nextUrl.pathname

  // Check if the requested path matches any allowed paths
  const hasPermission = allowedPaths.some(path => {
    // Exact match
    if (path === requestedPath) return true
    // Match path with trailing slash
    if (path === requestedPath + '/') return true
    if (path + '/' === requestedPath) return true
    // Match path with additional segments (for nested routes)
    if (requestedPath.startsWith(path + '/')) return true
    return false
  })

  if (!hasPermission) {
    // Check if user is admin (they can access all routes)
    const { data: isAdmin } = await supabase.rpc('has_role', { 
      role_name: 'admin' 
    })

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 