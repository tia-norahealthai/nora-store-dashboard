import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/reset-password']
const SUPER_ADMIN_ROUTES = ['/admin']
const BUSINESS_OWNER_ROUTES = [
  '/', // dashboard
  '/orders',
  '/opportunities',
  '/invoices',
  '/menu',
  '/maria',
  '/maria/history',
  '/settings'
]

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

  // Require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Get user roles
  const { data: roles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', session.user.id)
    .single()

  const userRole = roles?.roles?.name

  // Super admin can access everything
  if (userRole === 'super_admin') {
    return res
  }

  // Business owner access control
  if (userRole === 'business_owner') {
    const isAllowedRoute = BUSINESS_OWNER_ROUTES.some(route => 
      req.nextUrl.pathname === route || 
      (route.endsWith('/history') && req.nextUrl.pathname.startsWith(route))
    )

    if (!isAllowedRoute) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 