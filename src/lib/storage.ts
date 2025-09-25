import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { Category } from '@/types/category';
import { Activity } from '@/types/activity';
import { supabase } from './supabase';

// Product operations
export const productStorage = {
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      categoryId: item.category_id
    }));
  },
  
  getById: async (id: string): Promise<Product | undefined> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      categoryId: data.category_id
    };
  },
  
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        price: product.price,
        category_id: product.categoryId || null
      })
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Error creating product: ${error?.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      categoryId: data.category_id
    };
  },
  
  update: async (id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product | null> => {
    const updateData: { name?: string; price?: number; category_id?: string | null } = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId || null;
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      categoryId: data.category_id
    };
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    return !error;
  },
};

// Customer operations
export const customerStorage = {
  getAll: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        customer_products (
          products (*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      purchasedProducts: item.customer_products.map((cp: { products: { id: string; name: string; price: number; category_id: string | null } }) => ({
        id: cp.products.id,
        name: cp.products.name,
        price: cp.products.price,
        categoryId: cp.products.category_id
      }))
    }));
  },
  
  getById: async (id: string): Promise<Customer | undefined> => {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        customer_products (
          products (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      purchasedProducts: data.customer_products.map((cp: { products: { id: string; name: string; price: number; category_id: string | null } }) => ({
        id: cp.products.id,
        name: cp.products.name,
        price: cp.products.price,
        categoryId: cp.products.category_id
      }))
    };
  },
  
  create: async (customer: Omit<Customer, 'id' | 'purchasedProducts'>): Promise<Customer> => {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customer.name,
        email: customer.email
      })
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Error creating customer: ${error?.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      purchasedProducts: []
    };
  },
  
  update: async (id: string, updates: Partial<Omit<Customer, 'id'>>): Promise<Customer | null> => {
    const updateData: { name?: string; email?: string } = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    
    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        customer_products (
          products (*)
        )
      `)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      purchasedProducts: data.customer_products.map((cp: { products: { id: string; name: string; price: number; category_id: string | null } }) => ({
        id: cp.products.id,
        name: cp.products.name,
        price: cp.products.price,
        categoryId: cp.products.category_id
      }))
    };
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    return !error;
  },
  
  addProductToCustomer: async (customerId: string, productId: string): Promise<boolean> => {
    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('customer_products')
      .select('id')
      .eq('customer_id', customerId)
      .eq('product_id', productId)
      .single();
    
    if (existing) return true; // Already exists
    
    const { error } = await supabase
      .from('customer_products')
      .insert({
        customer_id: customerId,
        product_id: productId
      });
    
    return !error;
  },
  
  removeProductFromCustomer: async (customerId: string, productId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('customer_products')
      .delete()
      .eq('customer_id', customerId)
      .eq('product_id', productId);
    
    return !error;
  },
};

// Category operations
export const categoryStorage = {
  getAll: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      color: item.color
    }));
  },
  
  getById: async (id: string): Promise<Category | undefined> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color
    };
  },
  
  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        description: category.description,
        color: category.color
      })
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Error creating category: ${error?.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color
    };
  },
  
  update: async (id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category | null> => {
    const updateData: { name?: string; description?: string; color?: string } = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.color !== undefined) updateData.color = updates.color;
    
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color
    };
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    return !error;
  },
};

// Activity operations
export const activityStorage = {
  getAll: async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      customerId: item.customer_id,
      customerName: item.customer_name,
      product: {
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        categoryId: undefined
      },
      date: item.date,
      type: item.type as 'purchase' | 'refund' | 'other',
      notes: item.notes
    }));
  },
  
  getByCustomerId: async (customerId: string): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      customerId: item.customer_id,
      customerName: item.customer_name,
      product: {
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        categoryId: undefined
      },
      date: item.date,
      type: item.type as 'purchase' | 'refund' | 'other',
      notes: item.notes
    }));
  },
  
  create: async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        customer_id: activity.customerId,
        customer_name: activity.customerName,
        product_id: activity.product.id,
        product_name: activity.product.name,
        product_price: activity.product.price,
        date: activity.date,
        type: activity.type,
        notes: activity.notes
      })
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Error creating activity: ${error?.message}`);
    }
    
    return {
      id: data.id,
      customerId: data.customer_id,
      customerName: data.customer_name,
      product: {
        id: data.product_id,
        name: data.product_name,
        price: data.product_price,
        categoryId: undefined
      },
      date: data.date,
      type: data.type as 'purchase' | 'refund' | 'other',
      notes: data.notes
    };
  },
  
  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    return !error;
  },
  
  logPurchase: async function(customer: Customer, product: Product, notes?: string): Promise<Activity> {
    return this.create({
      customerId: customer.id,
      customerName: customer.name,
      product,
      date: new Date().toISOString(),
      type: 'purchase',
      notes,
    });
  },
};

// Analytics and statistics
export const analytics = {
  getTotalProducts: async (): Promise<number> => {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error counting products:', error);
      return 0;
    }
    
    return count || 0;
  },

  getTotalCustomers: async (): Promise<number> => {
    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error counting customers:', error);
      return 0;
    }
    
    return count || 0;
  },

  getTotalRevenue: async (): Promise<number> => {
    const { data, error } = await supabase
      .from('activities')
      .select('product_price')
      .eq('type', 'purchase');
    
    if (error) {
      console.error('Error calculating revenue:', error);
      return 0;
    }
    
    return data.reduce((total, activity) => total + activity.product_price, 0);
  },

  getMostSoldProducts: async (limit: number = 5): Promise<Array<{ product: Product; salesCount: number }>> => {
    const { data, error } = await supabase
      .from('activities')
      .select('product_id, product_name, product_price')
      .eq('type', 'purchase');
    
    if (error) {
      console.error('Error fetching sales data:', error);
      return [];
    }
    
    const productSales: Record<string, { product: Product; count: number }> = {};
    
    data.forEach(activity => {
      if (productSales[activity.product_id]) {
        productSales[activity.product_id].count++;
      } else {
        productSales[activity.product_id] = {
          product: {
            id: activity.product_id,
            name: activity.product_name,
            price: activity.product_price,
            categoryId: undefined
          },
          count: 1
        };
      }
    });
    
    return Object.values(productSales)
      .map(({ product, count }) => ({ product, salesCount: count }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit);
  },

  getRevenueByProduct: async (): Promise<Array<{ product: Product; revenue: number }>> => {
    const { data, error } = await supabase
      .from('activities')
      .select('product_id, product_name, product_price')
      .eq('type', 'purchase');
    
    if (error) {
      console.error('Error fetching revenue data:', error);
      return [];
    }
    
    const productRevenue: Record<string, { product: Product; revenue: number }> = {};
    
    data.forEach(activity => {
      if (productRevenue[activity.product_id]) {
        productRevenue[activity.product_id].revenue += activity.product_price;
      } else {
        productRevenue[activity.product_id] = {
          product: {
            id: activity.product_id,
            name: activity.product_name,
            price: activity.product_price,
            categoryId: undefined
          },
          revenue: activity.product_price
        };
      }
    });
    
    return Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue);
  },
};
