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
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          user_id?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          category_id: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          category_id?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          category_id?: string | null
          user_id?: string
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          user_id?: string
          created_at?: string
        }
      }
      customer_products: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          user_id?: string
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
          user_id: string
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
          user_id: string
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
          user_id?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
