import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our existing interfaces
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          category_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          category_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          category_id?: string | null
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      customer_products: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          customer_id: string
          customer_name: string
          product_id: string
          product_name: string
          product_price: number
          date: string
          type: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          customer_name: string
          product_id: string
          product_name: string
          product_price: number
          date: string
          type: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          customer_name?: string
          product_id?: string
          product_name?: string
          product_price?: number
          date?: string
          type?: string
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}
