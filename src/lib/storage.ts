import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { Category } from '@/types/category';
import { Activity } from '@/types/activity';
import { SupabaseCustomer, SupabaseProduct, SupabaseCustomerProduct, SupabaseProductCategory } from '@/types/supabase';

// Extended types for database responses
type ProductWithRelations = SupabaseProduct & {
  product_categories: Array<{
    categories: Category | null;
  }>;
};

type CustomerProductJoin = {
  id: string;
  customer_id: string;
  product_id: string;
  products: ProductWithRelations | null;
};
import { supabase } from './supabase';

// Category operations
export const categoryStorage = {
  getAll: async (): Promise<Category[]> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data?.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || ''
      })) || [];
    } catch (error) {
      console.error('Error in categoryStorage.getAll:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Category | undefined> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching category:', error);
        return undefined;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || ''
      };
    } catch (error) {
      console.error('Error in categoryStorage.getById:', error);
      return undefined;
    }
  },

  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          description: category.description
        }])
        .select()
        .single();

      if (error || !data) {
        console.error('Error creating category:', error);
        throw error || new Error('Failed to create category');
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || ''
      };
    } catch (error) {
      console.error('Error in categoryStorage.create:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Error updating category:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || ''
      };
    } catch (error) {
      console.error('Error in categoryStorage.update:', error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in categoryStorage.delete:', error);
      return false;
    }
  }
};

// Product operations
export const productStorage = {
  getAll: async (): Promise<Product[]> => {
    try {
      console.log('Fetching products from database...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            categories (*)
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Handle case where data is null or undefined
      if (!data) {
        console.log('No products found in the database');
        return [];
      }

      console.log(`Successfully fetched ${data.length} products`);

      try {
        // Map products to include categories
        const mappedProducts = data.map((product) => {
          // Safely access product_categories and handle potential null/undefined
          const productCategories = Array.isArray((product as any).product_categories) 
            ? (product as any).product_categories 
            : [];

          const categories = productCategories
            .filter((pc: any) => pc && typeof pc === 'object' && 'categories' in pc && pc.categories)
            .map((pc: any) => pc.categories as Category);

          return {
            id: product.id,
            name: product.name || 'Unnamed Product',
            price: typeof product.price === 'number' ? product.price : 0,
            categoryId: product.category_id || undefined,
            categories: categories || []
          } as Product;
        });

        return mappedProducts;
      } catch (mappingError) {
        console.error('Error mapping products:', mappingError);
        throw new Error('Failed to process product data. The data format may be incorrect.');
      }
    } catch (error) {
      console.error('Error in productStorage.getAll:', error);
      throw error instanceof Error 
        ? error 
        : new Error('An unknown error occurred while fetching products');
    }
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
    console.log('Attempting to create product:', JSON.stringify(product, null, 2));
    
    // Validate input
    if (!product.name || product.name.trim() === '') {
      const error = new Error('Product name is required');
      console.error('Validation error:', error.message);
      throw error;
    }
    
    if (typeof product.price !== 'number' || isNaN(product.price)) {
      const error = new Error('Price must be a valid number');
      console.error('Validation error:', error.message);
      throw error;
    }
    
    if (product.price < 0) {
      const error = new Error('Price cannot be negative');
      console.error('Validation error:', error.message);
      throw error;
    }

    try {
      // First, check if user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Unable to verify authentication status');
      }
      
      if (!sessionData?.session) {
        const error = new Error('User must be authenticated to create products');
        console.error('Authentication error:', error.message);
        throw error;
      }

      const productData = {
        name: product.name.trim(),
        price: product.price,
        category_id: product.categoryId || null,
        created_by: sessionData.session.user.id
      };

      console.log('Creating product with data:', JSON.stringify(productData, null, 2));

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select('*')
        .single();
      
      if (error) {
        const errorDetails = {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          productData
        };
        console.error('Database error creating product:', JSON.stringify(errorDetails, null, 2));
        
        // Provide more user-friendly error messages
        if (error.code === '42501') {
          throw new Error('Permission denied. You do not have permission to create products.');
        } else if (error.code === '23505') {
          throw new Error('A product with this name already exists.');
        } else if (error.code === '23503') {
          throw new Error('The specified category does not exist.');
        } else {
          throw new Error(`Failed to create product: ${error.message}`);
        }
      }
      
      if (!data) {
        const error = new Error('No data returned after product creation');
        console.error('Data error:', error.message);
        throw error;
      }
      
      console.log('Product created successfully:', JSON.stringify(data, null, 2));
      
      const createdProduct: Product = {
        id: data.id,
        name: data.name,
        price: data.price,
        categoryId: data.category_id || undefined,
        categories: []
      };
      
      return createdProduct;
      
    } catch (error) {
      // Log the full error for debugging
      console.error('Exception while creating product:', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : 'Unknown error',
        product: product,
        timestamp: new Date().toISOString()
      });
      
      // Re-throw with a more user-friendly message if it's not already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the product. Please try again.');
    }
  },
  
  update: async (id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product | null> => {
    const updateData: any = {};
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
    console.log('Fetching all customers...');
    try {
      // First, get all customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }
      
      if (!customersData || customersData.length === 0) {
        console.log('No customers found');
        return [];
      }
      
      console.log('Received customer data:', customersData);
      
      // For each customer, get their products
      const customersWithProducts: Customer[] = [];
      
      for (const customer of customersData) {
        try {
          // Get customer products with type-safe query
          // Define the type for the joined data
          type CustomerProductJoin = {
            id: string;
            customer_id: string;
            product_id: string;
            products: (SupabaseProduct & {
              product_categories: Array<{
                categories: Category | null;
              }>;
            }) | null;
          };
          
          // Get customer products with proper typing
          const { data: customerProducts, error: productsError } = await supabase
            .from('customer_products')
            .select(`
              id,
              customer_id,
              product_id,
              products (
                *,
                product_categories (
                  *,
                  categories (*)
                )
              )
            `)
            .eq('customer_id', customer.id);
            
          const purchasedProducts: Product[] = [];
            
          if (productsError) {
            console.error(`Error fetching products for customer ${customer.id}:`, productsError);
            // Continue with next customer even if products fail to load
            continue;
          }
          
          if (customerProducts && customerProducts.length > 0) {
            // Process each customer product with proper type checking
            for (const cp of customerProducts) {
              if (cp.products) {
                // Safely cast the product data
                const product = cp.products as unknown as {
                  id: string;
                  name: string;
                  price: number;
                  category_id?: string;
                  product_categories: Array<{
                    categories: Category | null;
                  }>;
                };
                
                // Extract and filter categories
                const categories = (product.product_categories || [])
                  .map(pc => pc?.categories)
                  .filter((c): c is Category => c !== null && c !== undefined);
                
                // Create the product with proper typing
                const productData: Product = {
                  id: product.id,
                  name: product.name || 'Unnamed Product',
                  price: typeof product.price === 'number' ? product.price : 0,
                  categoryId: product.category_id || undefined,
                  categoryIds: categories.map(c => c.id),
                  categories: categories
                };
                
                purchasedProducts.push(productData);
              }
            }
          }
          
          // Add customer to the result with their products
          customersWithProducts.push({
            id: customer.id,
            name: customer.name || 'Unnamed Customer',
            email: customer.email || '',
            purchasedProducts
          });
        } catch (error) {
          console.error(`Error processing customer ${customer.id}:`, error);
          // If there's an error, add the customer with an empty product list
          customersWithProducts.push({
            id: customer.id,
            name: customer.name || 'Unnamed Customer',
            email: customer.email || '',
            purchasedProducts: []
          });
        }
      }
      
      console.log('Customers with products:', customersWithProducts);
      return customersWithProducts;
    } catch (error) {
      console.error('Excepción al obtener clientes:', error);
      throw error; // Relanzar el error para manejarlo en el componente
    }
  },
  
  getById: async (id: string): Promise<Customer | undefined> => {
    try {
      // First get the customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (customerError || !customer) {
        console.error('Error fetching customer:', customerError);
        return undefined;
      }

      // Then get the customer's products
      const { data: customerProducts, error: productsError } = await supabase
        .from('customer_products')
        .select(`
          id,
          product_id,
          products (
            *,
            product_categories (
              *,
              categories (*)
            )
          )
        `)
        .eq('customer_id', id);

      if (productsError) {
        console.error('Error fetching customer products:', productsError);
        return {
          id: customer.id,
          name: customer.name || 'Unnamed Customer',
          email: customer.email || '',
          purchasedProducts: []
        };
      }
      
      console.log('Customer products data:', customerProducts);
      
      // Map the products with their categories
      const purchasedProducts: Product[] = [];
      
      if (customerProducts && customerProducts.length > 0) {
        for (const cp of customerProducts) {
          if (!cp.products) continue;
          
          // Safely cast the product data
          const product = cp.products as unknown as {
            id: string;
            name: string;
            price: number;
            category_id?: string;
            product_categories?: Array<{
              categories: {
                id: string;
                name: string;
                description?: string;
              } | null;
            }>;
          };
          
          // Map categories if they exist
          const categories: Category[] = [];
          if (product.product_categories && product.product_categories.length > 0) {
            for (const pc of product.product_categories) {
              if (pc?.categories) {
                categories.push({
                  id: pc.categories.id,
                  name: pc.categories.name,
                  description: pc.categories.description || ''
                });
              }
            }
          }
          
          // Create the product with proper typing
          const productData: Product = {
            id: product.id,
            name: product.name || 'Unnamed Product',
            price: typeof product.price === 'number' ? product.price : 0,
            categoryId: product.category_id || undefined,
            categoryIds: categories.map(c => c.id),
            categories
          };
          
          purchasedProducts.push(productData);
        }
      }
      
      // Return the complete customer with products
      return {
        id: customer.id,
        name: customer.name || 'Unnamed Customer',
        email: customer.email || '',
        purchasedProducts
      };
    } catch (error) {
      console.error('Error in getById:', error);
      return undefined;
    }
  },
  
  create: async (customer: Omit<Customer, 'id' | 'purchasedProducts'>): Promise<Customer> => {
    console.log('Intentando crear cliente:', customer);
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          email: customer.email
        })
        .select()
        .single();
      
      if (error || !data) {
        console.error('Error en la respuesta de creación de cliente:', { error, data });
        throw new Error(`Error creating customer: ${error?.message}`);
      }
      
      console.log('Cliente creado exitosamente:', data);
      
      // Verificar que el cliente existe en la base de datos
      const { data: verifyData, error: verifyError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', data.id)
        .single();
      
      if (verifyError || !verifyData) {
        console.error('No se pudo verificar el cliente después de crearlo:', verifyError);
      } else {
        console.log('Cliente verificado en la base de datos:', verifyData);
      }
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        purchasedProducts: []
      };
    } catch (error) {
      console.error('Excepción al crear cliente:', error);
      throw error;
    }
  },
  
  update: async (id: string, updates: Partial<Omit<Customer, 'id'>>): Promise<Customer | null> => {
    const updateData: any = {};
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
      purchasedProducts: data.customer_products.map((cp: any) => ({
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
    try {
      const { error } = await supabase
        .from('customer_products')
        .delete()
        .eq('customer_id', customerId)
        .eq('product_id', productId);
      
      if (error) {
        console.error('Error al eliminar el producto del cliente:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Excepción al eliminar el producto del cliente:', error);
      return false;
    }
  }
};

// Activity operations
export const activityStorage = {
  // Get all activities
  getAll: async (): Promise<Activity[]> => {
    try {
      console.log('=== STARTING ACTIVITIES LOAD ===');
      
      // First, get only the basic activity fields
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        throw activitiesError;
      }
      
      if (!activitiesData || activitiesData.length === 0) {
        console.log('No activities found in the database');
        return [];
      }
      
      console.log(`Found ${activitiesData.length} activities in the database`);
      
      // Now get related products
      const productIds = activitiesData
        .map(activity => activity.product_id)
        .filter((id): id is string => !!id);
      
      type ProductMap = {
        id: string;
        name: string;
        price: number;
        categoryId?: string;
        categoryIds: string[];
        categories: Category[];
      };
      
      const productsMap = new Map<string, ProductMap>();
      
      if (productIds.length > 0) {
        console.log(`Buscando ${productIds.length} productos relacionados...`);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);
          
        if (productsError) {
          console.error('Error al obtener productos:', productsError);
        } else if (productsData) {
          // Create a properly typed map of products
          const newProductsMap = new Map<string, ProductMap>();
          
          for (const p of productsData) {
            if (p) {
              newProductsMap.set(p.id, {
                id: p.id,
                name: p.name || 'Unnamed Product',
                price: p.price || 0,
                categoryId: p.category_id || undefined,
                categoryIds: p.category_id ? [p.category_id] : [],
                categories: []
              });
            }
          }
          
          // Update productsMap with the new values
          newProductsMap.forEach((value, key) => {
            productsMap.set(key, value);
          });
          
          console.log(`Se encontraron ${newProductsMap.size} productos relacionados`);
        }
      }

      // Map activities to the expected format
      return activitiesData.map(activity => {
        const productData = activity.product_id ? productsMap.get(activity.product_id) : undefined;
        
        if (!productData) {
          // Return a minimal valid product if not found
          const minimalProduct = {
            id: 'unknown',
            name: 'Producto desconocido',
            price: 0,
            categoryId: undefined,
            categoryIds: [],
            categories: []
          };
          
          return {
            id: activity.id,
            customerId: activity.customer_id,
            customerName: activity.customer_name || 'Unknown Customer',
            product: minimalProduct,
            date: activity.date,
            type: activity.type as 'purchase' | 'refund' | 'other',
            notes: activity.notes || undefined
          };
        }
        
        // Create the product object with all required fields
        const product = {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          categoryId: productData.categoryId,
          categoryIds: productData.categoryIds || [],
          categories: productData.categories || []
        };
        
        return {
          id: activity.id,
          customerId: activity.customer_id,
          customerName: activity.customer_name || 'Unknown Customer',
          product,
          date: activity.date,
          type: activity.type as 'purchase' | 'refund' | 'other',
          notes: activity.notes || undefined
        };
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },
  // Get activities by customer ID
  getByCustomerId: async (customerId: string): Promise<Activity[]> => {
    try {
      type ActivityRow = {
        id: string;
        customer_id: string;
        customer_name: string | null;
        product_id: string | null;
        product_name: string | null;
        product_price: number | null;
        date: string;
        type: 'purchase' | 'refund' | 'other';
        notes: string | null;
      };
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching customer activities:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }

      // For each activity, create a valid activity object
      return data.map(activity => {
        // Create a minimal valid product if product_id exists
        const product = {
          id: activity.product_id || 'unknown',
          name: activity.product_name || 'Unknown Product',
          price: activity.product_price || 0,
          categoryId: undefined as string | undefined,
          categoryIds: [] as string[],
          categories: [] as Category[]
        };
        
        return {
          id: activity.id,
          customerId: activity.customer_id,
          customerName: activity.customer_name || 'Unknown Customer',
          product,
          date: activity.date,
          type: activity.type as 'purchase' | 'refund' | 'other',
          notes: activity.notes || undefined
        };
      });
    } catch (error) {
      console.error('Error in getByCustomerId:', error);
      return [];
    }
  },
  // Create a new activity
  create: async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    if (!activity.product) {
      throw new Error('Product is required to create an activity');
    }
    try {
      // First get the product to get its category
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', activity.product.id)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        throw productError;
      }

      // Prepare the activity data for insertion
      const activityData = {
        customer_id: activity.customerId,
        customer_name: activity.customerName,
        product_id: activity.product.id,
        product_name: activity.product.name,
        product_price: activity.product.price,
        date: activity.date,
        type: activity.type,
        notes: activity.notes || ''
      };

      // Insert the activity
      const { data, error } = await supabase
        .from('activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from activity creation');

      // Get categories for the product
      const categories: Category[] = [];
      if (productData.category_id) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', productData.category_id)
          .single();
          
        if (!categoryError && categoryData) {
          categories.push({
            id: categoryData.id,
            name: categoryData.name,
            description: categoryData.description || ''
          });
        }
      }

      // Create the product object with all required fields
      const product = {
        id: data.product_id,
        name: data.product_name || 'Unnamed Product',
        price: data.product_price || 0,
        categoryId: productData?.category_id || undefined,
        categoryIds: productData?.category_id ? [productData.category_id] : [],
        categories
      };
      
      // Return the created activity with all necessary fields
      const result: Activity = {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name || 'Unknown Customer',
        product,
        date: data.date,
        type: data.type as 'purchase' | 'refund' | 'other',
        notes: data.notes || undefined
      };
      
      return result;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  },

  // Log a purchase activity
  logPurchase: async (customer: Customer, product: Product, notes?: string): Promise<Activity> => {
    if (!customer || !product) {
      throw new Error('Customer and product are required to log a purchase');
    }
    console.log('=== INICIANDO REGISTRO DE COMPRA ===');
    console.log('Cliente:', { id: customer.id, name: customer.name });
    console.log('Producto:', { 
      id: product.id, 
      name: product.name, 
      price: product.price,
      categoryId: product.categoryId 
    });
    
    try {
      // Verificar que el cliente existe
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id', customer.id)
        .single();
      
      if (customerError || !customerData) {
        console.error('Error: Cliente no encontrado', customerError);
        throw new Error(`Cliente no encontrado: ${customerError?.message || 'ID no válido'}`);
      }
      
      // Verificar que el producto existe
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, price, category_id')
        .eq('id', product.id)
        .single();
      
      if (productError || !productData) {
        console.error('Error: Producto no encontrado', productError);
        throw new Error(`Producto no encontrado: ${productError?.message || 'ID no válido'}`);
      }
      
      const activity: Omit<Activity, 'id'> = {
        customerId: customer.id,
        customerName: customer.name,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          categoryId: product.categoryId,
          categoryIds: product.categoryId ? [product.categoryId] : [],
          categories: product.categories || []
        },
        date: new Date().toISOString(),
        type: 'purchase',
        notes: notes || `Compra de ${product.name}`
      };
      
      console.log('Registrando actividad:', activity);
      // Create the activity data
      const activityData: Omit<Activity, 'id'> = {
        customerId: customer.id,
        customerName: customer.name,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          categoryId: product.categoryId,
          categoryIds: product.categoryId ? [product.categoryId] : [],
          categories: product.categories || []
        },
        date: new Date().toISOString(),
        type: 'purchase' as const,
        notes: notes || `Purchase of ${product.name}`
      };
      
      // Create the activity using the create method
      const result = await activityStorage.create(activityData);
      console.log('Actividad registrada exitosamente:', result.id);
      return result;
      
    } catch (error) {
      console.error('=== ERROR AL REGISTRAR COMPRA ===');
      console.error('Cliente:', { id: customer.id, name: customer.name });
      console.error('Producto:', { id: product.id, name: product.name });
      console.error('Error detallado:', error);
      
      // Try to get more error details
      if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>;
        if ('message' in err) {
          console.error('Error message:', err.message);
        }
        if ('code' in err) {
          console.error('Error code:', err.code);
        }
        if ('details' in err) {
          console.error('Details:', err.details);
        }
        if ('hint' in err) {
          console.error('Hint:', err.hint);
        }
      }
      
      throw error;
    }
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

  getMostSoldCategories: async (limit: number = 5): Promise<Array<{ category: Category; salesCount: number }>> => {
    // Primero obtenemos todas las categorías para tener sus nombres y colores
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return [];
    }
    
    // Obtenemos todas las actividades de compra con información de productos
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*, products!inner(id, category_id)')
      .eq('type', 'purchase');
    
    if (error) {
      console.error('Error fetching sales data by category:', error);
      return [];
    }
    
    // Contamos las ventas por categoría
    const categorySales: Record<string, { category: Category; count: number }> = {};
    
    activities.forEach(activity => {
      const categoryId = activity.products?.category_id;
      if (!categoryId) return;
      
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      if (categorySales[categoryId]) {
        categorySales[categoryId].count++;
      } else {
        categorySales[categoryId] = {
          category: {
            id: category.id,
            name: category.name,
            color: category.color
          },
          count: 1
        };
      }
    });
    
    // Ordenamos por cantidad de ventas, aseguramos que count sea un número y limitamos los resultados
    return Object.values(categorySales)
      .map(item => ({
        ...item,
        count: Number(item.count) || 0 // Aseguramos que count sea un número
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ category, count }) => ({
        category,
        salesCount: count // Mapeamos count a salesCount
      }));
  },
};
