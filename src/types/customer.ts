import { Product, Category } from './product';

export interface Customer {
  id: string;
  name: string;
  email: string;
  purchasedProducts: Array<{
    id: string;
    name: string;
    price: number;
    categoryId?: string;
    categoryIds?: string[];
    categories?: Category[];
  }>;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'purchasedProducts'>;
