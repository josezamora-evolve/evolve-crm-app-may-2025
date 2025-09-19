import { createClient } from '@/utils/supabase/server'

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('No authenticated user found')
  }

  return user
}

export async function withUser<T>(callback: (userId: string) => Promise<T>): Promise<T> {
  const user = await getAuthenticatedUser()
  return callback(user.id)
}