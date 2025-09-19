export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  // Mantenemos categoryId por compatibilidad con código existente
  categoryId?: string;
  // Soporte para múltiples categorías
  categoryIds?: string[];
  // Lista completa de objetos de categoría
  categories?: Category[];
}

export type CreateProductInput = Omit<Product, 'id'>;
