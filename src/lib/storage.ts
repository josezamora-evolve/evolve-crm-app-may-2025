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
    console.log('Intentando crear producto:', product);
    try {
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
        console.error('Error en la respuesta de creación de producto:', { error, data });
        throw new Error(`Error creating product: ${error?.message}`);
      }
      
      console.log('Producto creado exitosamente:', data);
      
      // Verificar que el producto existe en la base de datos
      const { data: verifyData, error: verifyError } = await supabase
        .from('products')
        .select('*')
        .eq('id', data.id)
        .single();
      
      if (verifyError || !verifyData) {
        console.error('No se pudo verificar el producto después de crearlo:', verifyError);
      } else {
        console.log('Producto verificado en la base de datos:', verifyData);
      }
      
      return {
        id: data.id,
        name: data.name,
        price: data.price,
        categoryId: data.category_id
      };
    } catch (error) {
      console.error('Excepción al crear producto:', error);
      throw error;
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
    console.log('Obteniendo todos los clientes...');
    try {
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
      
      console.log('Clientes obtenidos:', data);
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        purchasedProducts: item.customer_products.map((cp: any) => ({
          id: cp.products.id,
          name: cp.products.name,
          price: cp.products.price,
          categoryId: cp.products.category_id
        }))
      }));
    } catch (error) {
      console.error('Excepción al obtener clientes:', error);
      return [];
    }
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
      purchasedProducts: data.customer_products.map((cp: any) => ({
        id: cp.products.id,
        name: cp.products.name,
        price: cp.products.price,
        categoryId: cp.products.category_id
      }))
    };
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
    const updateData: any = {};
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

// Función de utilidad para verificar todas las actividades
export const debugActivities = {
  checkAllActivities: async (): Promise<void> => {
    try {
      console.log('=== VERIFICANDO TODAS LAS ACTIVIDADES EN LA BASE DE DATOS ===');
      
      // 1. Obtener el conteo total de actividades
      const { count: totalActivities } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Total de actividades en la base de datos: ${totalActivities}`);
      
      // 2. Obtener todas las actividades con sus datos básicos
      const { data: allActivities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });
      
      if (activitiesError) throw activitiesError;
      
      console.log('=== DETALLES DE LAS ACTIVIDADES ===');
      allActivities?.forEach((activity, index) => {
        console.group(`Actividad #${index + 1}/${allActivities.length}`);
        console.log('ID:', activity.id);
        console.log('Tipo:', activity.type);
        console.log('Fecha:', activity.date);
        console.log('ID Cliente:', activity.customer_id);
        console.log('Nombre Cliente:', activity.customer_name);
        console.log('ID Producto:', activity.product_id);
        console.log('Notas:', activity.notes || '(sin notas)');
        console.groupEnd();
      });
      
      // 3. Verificar si hay actividades con el mismo ID de cliente
      if (allActivities && allActivities.length > 0) {
        const customerIds = [...new Set(allActivities.map(a => a.customer_id))];
        console.log(`\nClientes únicos encontrados: ${customerIds.length}`);
        
        // 4. Verificar si hay actividades con el mismo ID de producto
        const productIds = [...new Set(allActivities.map(a => a.product_id).filter(Boolean))];
        console.log(`Productos únicos referenciados: ${productIds.length}`);
        
        if (productIds.length > 0) {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds as string[]);
            
          if (productsError) {
            console.error('Error al verificar productos:', productsError);
          } else {
            console.log('Productos encontrados en la base de datos:', products?.length || 0);
            const missingProducts = productIds.filter(id => !products?.some(p => p.id === id));
            if (missingProducts.length > 0) {
              console.warn('ADVERTENCIA: Los siguientes IDs de producto no existen en la base de datos:', missingProducts);
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error al verificar actividades:', error);
    }
  }
};

// Activity operations
export const activityStorage = {
  getAll: async (): Promise<Activity[]> => {
    try {
      console.log('=== INICIANDO CARGA DE ACTIVIDADES ===');
      
      // Primero obtenemos solo los campos básicos de las actividades
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

      if (activitiesError) throw activitiesError;
      if (!activitiesData || activitiesData.length === 0) {
        console.log('No se encontraron actividades en la base de datos');
        return [];
      }
      
      console.log(`Se encontraron ${activitiesData.length} actividades en la base de datos`);
      
      // Ahora obtenemos los productos relacionados
      const productIds = activitiesData
        .map(activity => activity.product_id)
        .filter((id): id is string => !!id);
      
      let productsMap = new Map<string, any>();
      
      if (productIds.length > 0) {
        console.log(`Buscando ${productIds.length} productos relacionados...`);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);
          
        if (productsError) {
          console.error('Error al obtener productos:', productsError);
        } else if (productsData) {
          productsMap = new Map(productsData.map(p => [p.id, p]));
          console.log(`Se encontraron ${productsData.length} productos relacionados`);
        }
      }

      // Mapeamos las actividades con sus productos
      const activities = activitiesData.map(item => {
        const product = item.product_id ? {
          id: item.product_id,
          name: productsMap.get(item.product_id)?.name || 'Producto no encontrado',
          price: productsMap.get(item.product_id)?.price || 0,
          categoryId: productsMap.get(item.product_id)?.category_id || null,
          categoryIds: productsMap.get(item.product_id)?.category_id ? 
            [productsMap.get(item.product_id).category_id] : []
        } : undefined;
        
        console.log('Procesando actividad:', {
          id: item.id,
          type: item.type,
          customerId: item.customer_id,
          customerName: item.customer_name,
          hasProduct: !!item.product_id,
          product: product ? {
            id: product.id,
            name: product.name,
            categoryId: product.categoryId
          } : 'Sin producto'
        });
        
        return {
          id: item.id,
          customerId: item.customer_id,
          customerName: item.customer_name,
          product,
          date: item.date,
          type: item.type as 'purchase' | 'refund' | 'other',
          notes: item.notes || ''
        };
      });
      
      console.log('Actividades procesadas:', activities);
      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },
  
  getByCustomerId: async (customerId: string): Promise<Activity[]> => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          products (
            id,
            name,
            price,
            category_id
          )
        `)
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        customerId: item.customer_id,
        customerName: item.customer_name,
        product: {
          id: item.product_id,
          name: item.products?.name || 'Producto desconocido',
          price: item.products?.price || 0,
          categoryId: item.products?.category_id || null,
          categoryIds: item.products?.category_id ? [item.products.category_id] : []
        },
        date: item.date,
        type: item.type as 'purchase' | 'refund' | 'other',
        notes: item.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching customer activities:', error);
      return [];
    }
  },
  
  create: async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    try {
      // Primero obtenemos el producto para obtener su categoría
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('name, price, category_id')
        .eq('id', activity.product.id)
        .single();

      if (productError) throw productError;

      const { data, error } = await supabase
        .from('activities')
        .insert([{
          customer_id: activity.customerId,
          customer_name: activity.customerName,
          product_id: activity.product.id,
          product_name: activity.product.name,
          product_price: activity.product.price,
          date: activity.date,
          type: activity.type,
          notes: activity.notes || ''
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name,
        product: {
          id: data.product_id,
          name: data.product_name,
          price: data.product_price,
          categoryId: productData?.category_id || null,
          categoryIds: productData?.category_id ? [productData.category_id] : []
        },
        date: data.date,
        type: data.type as 'purchase' | 'refund' | 'other',
        notes: data.notes || ''
      };
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
  
  logPurchase: async function(customer: Customer, product: Product, notes?: string): Promise<Activity> {
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
          categoryIds: product.categoryId ? [product.categoryId] : []
        },
        date: new Date().toISOString(),
        type: 'purchase',
        notes: notes || `Compra de ${product.name}`
      };
      
      console.log('Registrando actividad:', activity);
      const result = await this.create(activity);
      console.log('Actividad registrada exitosamente:', result.id);
      return result;
      
    } catch (error) {
      console.error('=== ERROR AL REGISTRAR COMPRA ===');
      console.error('Cliente:', { id: customer.id, name: customer.name });
      console.error('Producto:', { id: product.id, name: product.name });
      console.error('Error detallado:', error);
      
      // Intentar obtener más detalles del error
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
        if ('code' in error) {
          console.error('Código de error:', (error as any).code);
        }
        if ('details' in error) {
          console.error('Detalles:', (error as any).details);
        }
        if ('hint' in error) {
          console.error('Sugerencia:', (error as any).hint);
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
