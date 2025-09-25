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
    // Check if we're on the client side
    const redirectTo = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })
    return { data, error }
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
