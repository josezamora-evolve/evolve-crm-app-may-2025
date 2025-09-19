import { createClient } from '@supabase/supabase-js'

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están configuradas correctamente')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '***' : 'No definida')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' : 'No definida')
  throw new Error('Las variables de entorno de Supabase no están configuradas correctamente')
}

console.log('Inicializando cliente de Supabase...')
console.log('URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Verificar conexión
const checkConnection = async () => {
  try {
    const { error } = await supabase.from('customers').select('*').limit(1);
    if (error) {
      console.error('Error al conectar con Supabase:', error);
    } else {
      console.log('Conexión con Supabase establecida correctamente');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Excepción al conectar con Supabase:', errorMessage);
  }
};

// Ejecutar la verificación de conexión
checkConnection();

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
