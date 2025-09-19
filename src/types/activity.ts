import { Product, Category } from './product';

export interface Activity {
  id: string;
  customerId: string;
  customerName: string;
  product: {
    id: string;
    name: string;
    price: number;
    categoryId?: string;
    categoryIds?: string[];
    categories?: Category[];
  };
  date: string; // Formato ISO 8601 (ej: '2025-09-17T15:30:00Z')
  type: 'purchase' | 'refund' | 'other';
  notes?: string;
}

export type CreateActivityInput = Omit<Activity, 'id'>;
