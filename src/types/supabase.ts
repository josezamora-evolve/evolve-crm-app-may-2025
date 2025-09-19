// Tipos para las respuestas de Supabase

export interface SupabaseProductCategory {
  categories: {
    id: string;
    name: string;
  } | null;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  price: number;
  category_id: string | null;
  product_categories: SupabaseProductCategory[];
}

export interface SupabaseCustomerProduct {
  products: SupabaseProduct;
}

export interface SupabaseCustomer {
  id: string;
  name: string;
  email: string;
  customer_products: SupabaseCustomerProduct[];
}
