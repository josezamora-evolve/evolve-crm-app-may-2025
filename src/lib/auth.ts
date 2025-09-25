import { createClient } from '@/utils/supabase/client'
import { AuthError, User, Session } from '@supabase/supabase-js'
import type { AuthChangeEvent } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, profile?: { first_name: string; last_name: string }): Promise<AuthResponse> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profile ? {
          first_name: profile.first_name,
          last_name: profile.last_name
        } : {}
      }
    })
    return { user: data.user, error }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user: data.user, error }
  },

  // Sign in with Google
  async signInWithGoogle() {
    const supabase = createClient()
    
    // Get the current URL origin or use the environment variables
    let siteUrl = 'http://localhost:3000' // Default fallback
    
    if (typeof window !== 'undefined') {
      // Client-side: use window.location.origin
      siteUrl = window.location.origin
    } else {
      // Server-side: try environment variables in order of preference
      siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                (process?.env?.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null) || 
                'http://localhost:3000'
    }
    
    // Ensure the URL has the correct protocol and no trailing slash
    if (!siteUrl.startsWith('http')) {
      siteUrl = `https://${siteUrl}`
    }
    const cleanSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl
    const redirectTo = `${cleanSiteUrl}/auth/callback`
    
    console.log('Using redirect URL:', redirectTo) // For debugging
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Google sign-in error:', error)
      return { data: null, error: error as Error }
    }
  },

  // Sign out
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createClient()
    return supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      callback(session?.user ?? null)
    })
  }
}
