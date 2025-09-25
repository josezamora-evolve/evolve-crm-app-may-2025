'use server';

import { createClient } from '@/utils/supabase/server'
import { withUser } from './user'

interface N8NHealthResponse {
  status: string;
}

export async function checkN8NHealth(): Promise<{ isOnline: boolean; error?: string }> {
  const webhookUrl = process.env.N8N_WEBHOOK_HEALTH_URL;
  
  if (!webhookUrl) {
    return { isOnline: false, error: 'N8N webhook URL not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data: N8NHealthResponse = await response.json();
      return { isOnline: data.status === 'ok' };
    } else {
      return { isOnline: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('Error checking N8N health:', error);
    return { 
      isOnline: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Categories
export async function getCategories() {
  return withUser(async (_) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      // No need to filter by user_id here since RLS will handle it
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  })
}

export async function createCategory(category: { name: string; description?: string; color?: string }) {
  return withUser(async (userId) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, user_id: userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  })
}

// Products
export async function getProducts() {
  return withUser(async (userId) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  })
}

export async function createProduct(product: { name: string; price: number; category_id?: string }) {
  return withUser(async (userId) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, user_id: userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  })
}

// Customers
export async function getCustomers() {
  return withUser(async (userId) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  })
}

export async function createCustomer(customer: { name: string; email: string }) {
  return withUser(async (userId) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customers')
      .insert([{ ...customer, user_id: userId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  })
}

// Customer Products
export async function getCustomerProducts(customerId: string) {
  return withUser(async (userId) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customer_products')
      .select('*, product:products(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  })
}

export async function addProductToCustomer(customerId: string, productId: string) {
  return withUser(async (userId) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customer_products')
      .insert([{ 
        customer_id: customerId, 
        product_id: productId,
        user_id: userId 
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  })
}
