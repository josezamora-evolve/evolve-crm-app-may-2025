import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update session and get response with refreshed cookies
  const response = await updateSession(request)
  
  // Get pathname for routing logic
  const pathname = request.nextUrl.pathname
  
  // Create a supabase client to check auth status
  // We need to recreate the client here to get the updated session
  const { createServerClient } = await import('@supabase/ssr')
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {
          // Not needed in middleware after updateSession
        },
        remove() {
          // Not needed in middleware after updateSession
        },
      },
    }
  )

  // Use getUser() instead of getSession() for security
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect root to dashboard if authenticated
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!user && pathname !== '/login' && pathname !== '/register' && !pathname.startsWith('/auth/') && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
