import { createClient } from '@/utils/supabase/client'
import { Database } from './database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export const profileService = {
  // Get user profile by user ID
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserProfile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return data
  },

  // Create user profile (usually handled by trigger, but can be used manually)
  async createUserProfile(userId: string, profile: { first_name?: string; last_name?: string; avatar_url?: string }): Promise<UserProfile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        avatar_url: profile.avatar_url || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data
  }
}
