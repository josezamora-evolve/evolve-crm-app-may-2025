export interface Product {
  id: string;
  name: string;
  price: number;
  categoryIds?: string[]; // Ahora soporta múltiples categorías
  // Mantenemos categoryId por compatibilidad con código existente
  categoryId?: string;
}

export type CreateProductInput = Omit<Product, 'id'>;
