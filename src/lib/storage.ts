import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { Category } from '@/types/category';

const STORAGE_KEYS = {
  PRODUCTS: 'crm_products',
  CUSTOMERS: 'crm_customers',
  CATEGORIES: 'crm_categories',
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

// Category operations
export const categoryStorage = {
  getAll: (): Category[] => getItem('CATEGORIES'),
  
  getById: (id: string): Category | undefined => {
    const categories = getItem<Category>('CATEGORIES');
    return categories.find(c => c.id === id);
  },
  
  create: (category: Omit<Category, 'id'>): Category => {
    const categories = getItem<Category>('CATEGORIES');
    const newCategory = {
      ...category,
      id: crypto.randomUUID(),
    };
    setItem('CATEGORIES', [...categories, newCategory]);
    return newCategory;
  },
  
  update: (id: string, updates: Partial<Omit<Category, 'id'>>): Category | null => {
    const categories = getItem<Category>('CATEGORIES');
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const updatedCategory = {
      ...categories[index],
      ...updates,
    };
    
    const updatedCategories = [...categories];
    updatedCategories[index] = updatedCategory;
    setItem('CATEGORIES', updatedCategories);
    
    return updatedCategory;
  },
  
  delete: (id: string): boolean => {
    const categories = getItem<Category>('CATEGORIES');
    const filtered = categories.filter(c => c.id !== id);
    
    if (categories.length === filtered.length) return false;
    
    setItem('CATEGORIES', filtered);
    return true;
  },
  
};
