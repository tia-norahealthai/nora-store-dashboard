import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/reset-password']
const PROTECTED_ROUTES = ['/restaurants', '/menu', '/customers', '/orders']
const ADMIN_ROUTES = ['/admin']
const BUSINESS_ROUTES = ['/restaurants', '/menu', '/customers', '/orders']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isPublicRoute = PUBLIC_ROUTES.includes(req.nextUrl.pathname)
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isBusinessRoute = BUSINESS_ROUTES.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Handle public routes
  if (isPublicRoute) {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return res
  }

  // Handle protected routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Check admin routes
  if (isAdminRoute) {
    const { data: isAdmin } = await supabase.rpc('has_role', { 
      role_name: 'admin' 
    })
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Check business routes
  if (isBusinessRoute) {
    const { data: isBusinessOwner } = await supabase.rpc('has_role', { 
      role_name: 'business_owner' 
    })
    
    if (!isBusinessOwner) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/restaurants/:path*',
    '/menu/:path*',
    '/customers/:path*',
    '/orders/:path*'
  ],
} 