import { Product } from '@/types/product';
import { Customer } from '@/types/customer';

const STORAGE_KEYS = {
  PRODUCTS: 'crm_products',
  CUSTOMERS: 'crm_customers',
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;

function getItem<T>(key: StorageKey): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS[key]);
  return data ? JSON.parse(data) : [];
}

function setItem<T>(key: StorageKey, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
}

// Product operations
export const productStorage = {
  getAll: (): Product[] => getItem('PRODUCTS'),
  
  getById: (id: string): Product | undefined => {
    const products = getItem<Product>('PRODUCTS');
    return products.find(p => p.id === id);
  },
  
  create: (product: Omit<Product, 'id'>): Product => {
    const products = getItem<Product>('PRODUCTS');
    const newProduct = {
      ...product,
      id: crypto.randomUUID(),
    };
    setItem('PRODUCTS', [...products, newProduct]);
    return newProduct;
  },
  
  update: (id: string, updates: Partial<Omit<Product, 'id'>>): Product | null => {
    const products = getItem<Product>('PRODUCTS');
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    const updatedProduct = {
      ...products[index],
      ...updates,
    };
    
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setItem('PRODUCTS', updatedProducts);
    
    return updatedProduct;
  },
  
  delete: (id: string): boolean => {
    const products = getItem<Product>('PRODUCTS');
    const filtered = products.filter(p => p.id !== id);
    
    if (products.length === filtered.length) return false;
    
    setItem('PRODUCTS', filtered);
    return true;
  },
};

// Customer operations
export const customerStorage = {
  getAll: (): Customer[] => getItem('CUSTOMERS'),
  
  getById: (id: string): Customer | undefined => {
    const customers = getItem<Customer>('CUSTOMERS');
    return customers.find(c => c.id === id);
  },
  
  create: (customer: Omit<Customer, 'id' | 'purchasedProducts'>): Customer => {
    const customers = getItem<Customer>('CUSTOMERS');
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      purchasedProducts: [],
    };
    setItem('CUSTOMERS', [...customers, newCustomer]);
    return newCustomer;
  },
  
  update: (id: string, updates: Partial<Omit<Customer, 'id'>>): Customer | null => {
    const customers = getItem<Customer>('CUSTOMERS');
    const index = customers.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const updatedCustomer = {
      ...customers[index],
      ...updates,
    };
    
    const updatedCustomers = [...customers];
    updatedCustomers[index] = updatedCustomer;
    setItem('CUSTOMERS', updatedCustomers);
    
    return updatedCustomer;
  },
  
  delete: (id: string): boolean => {
    const customers = getItem<Customer>('CUSTOMERS');
    const filtered = customers.filter(c => c.id !== id);
    
    if (customers.length === filtered.length) return false;
    
    setItem('CUSTOMERS', filtered);
    return true;
  },
  
  addProductToCustomer: (customerId: string, productId: string): boolean => {
    const customers = getItem<Customer>('CUSTOMERS');
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return false;
    
    // Check if product exists
    const product = productStorage.getById(productId);
    if (!product) return false;
    
    // Check if product is already added
    if (customer.purchasedProducts.some(p => p.id === productId)) return true;
    
    const updatedCustomer = {
      ...customer,
      purchasedProducts: [...customer.purchasedProducts, product],
    };
    
    const updatedCustomers = customers.map(c => 
      c.id === customerId ? updatedCustomer : c
    );
    
    setItem('CUSTOMERS', updatedCustomers);
    return true;
  },
  
  removeProductFromCustomer: (customerId: string, productId: string): boolean => {
    const customers = getItem<Customer>('CUSTOMERS');
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return false;
    
    const updatedCustomer = {
      ...customer,
      purchasedProducts: customer.purchasedProducts.filter(p => p.id !== productId),
    };
    
    const updatedCustomers = customers.map(c => 
      c.id === customerId ? updatedCustomer : c
    );
    
    setItem('CUSTOMERS', updatedCustomers);
    return true;
  },
};

// Analytics and statistics
export const analytics = {
  getTotalProducts: (): number => {
    return getItem<Product>('PRODUCTS').length;
  },

  getTotalCustomers: (): number => {
    return getItem<Customer>('CUSTOMERS').length;
  },

  getTotalRevenue: (): number => {
    const customers = getItem<Customer>('CUSTOMERS');
    return customers.reduce((total, customer) => {
      return total + customer.purchasedProducts.reduce((customerTotal, product) => {
        return customerTotal + product.price;
      }, 0);
    }, 0);
  },

  getMostSoldProducts: (limit: number = 5): Array<{ product: Product; salesCount: number }> => {
    const customers = getItem<Customer>('CUSTOMERS');
    const productSales: Record<string, { product: Product; count: number }> = {};

    customers.forEach(customer => {
      customer.purchasedProducts.forEach(product => {
        if (productSales[product.id]) {
          productSales[product.id].count++;
        } else {
          productSales[product.id] = { product, count: 1 };
        }
      });
    });

    return Object.values(productSales)
      .map(({ product, count }) => ({ product, salesCount: count }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit);
  },

  getRevenueByProduct: (): Array<{ product: Product; revenue: number }> => {
    const customers = getItem<Customer>('CUSTOMERS');
    const productRevenue: Record<string, { product: Product; revenue: number }> = {};

    customers.forEach(customer => {
      customer.purchasedProducts.forEach(product => {
        if (productRevenue[product.id]) {
          productRevenue[product.id].revenue += product.price;
        } else {
          productRevenue[product.id] = { product, revenue: product.price };
        }
      });
    });

    return Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue);
  },
};
