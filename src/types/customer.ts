import { Product } from './product';

export interface Customer {
  id: string;
  name: string;
  email: string;
  purchasedProducts: Product[];
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'purchasedProducts'>;
