export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export type CreateCategoryInput = Omit<Category, 'id'>;
