import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')

  console.log('Auth callback received:', { code, next, error, origin })

  // If there's an error in the OAuth flow
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(
      `${origin}/login?error=oauth_error&details=${encodeURIComponent(error)}`
    )
  }

  // If we have an authorization code
  if (code) {
    const supabase = await createClient()
    try {
      console.log('Exchanging code for session...')
      const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) {
        console.error('Error exchanging code for session:', authError)
        throw authError
      }
      
      console.log('Authentication successful, redirecting to:', `${origin}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(
        `${origin}/login?error=auth_error&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
      )
    }
  }

  // If we get here, something went wrong
  console.error('No code or error parameter found in callback URL')
  return NextResponse.redirect(
    `${origin}/login?error=invalid_request&details=No authentication code or error received`
  )
}
