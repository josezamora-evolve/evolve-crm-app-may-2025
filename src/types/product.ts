export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId?: string;
}

export type CreateProductInput = Omit<Product, 'id'>;
