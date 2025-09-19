'use client'

import { useAuth } from './AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { LogOut, Settings, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { profileService } from '@/lib/profile'
import { Database } from '@/lib/database.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export function UserProfile() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile()
    }
  }, [user?.id])

  const fetchUserProfile = async () => {
    if (!user?.id) return
    
    setLoading(true)
    const userProfile = await profileService.getUserProfile(user.id)
    setProfile(userProfile)
    setLoading(false)
  }

  if (!user) return null

  // Generate initials from name or email
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
    }
    if (profile?.first_name) {
      return profile.first_name.slice(0, 2).toUpperCase()
    }
    if (user.email) {
      const name = user.email.split('@')[0]
      return name.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  // Get display name
  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    if (profile?.first_name) {
      return profile.first_name
    }
    return user.email || 'Usuario'
  }

  // Get avatar URL - prioritize Google avatar, then custom avatar, then Gravatar
  const getAvatarUrl = () => {
    // Check if user signed in with Google and has avatar_url in user metadata
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url
    }
    
    // Check if profile has custom avatar
    if (profile?.avatar_url) {
      return profile.avatar_url
    }
    
    // Fallback to Gravatar
    if (user.email) {
      const hash = btoa(user.email.toLowerCase().trim())
      return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=40`
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
        </div>
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={getAvatarUrl() || undefined} 
            alt={getDisplayName()} 
          />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{getDisplayName()}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
