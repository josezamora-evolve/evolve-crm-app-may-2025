'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { Product, CreateProductInput } from '@/types/product';
import { Category } from '@/types/category';
import { productStorage, categoryStorage } from '@/lib/storage';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductInput>({ name: '', price: 0, categoryId: '' });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products and categories from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [loadedCategories, loadedProducts] = await Promise.all([
          categoryStorage.getAll(),
          productStorage.getAll()
        ]);
        setCategories(loadedCategories);
        setProducts(loadedProducts);
        setFilteredProducts(loadedProducts);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : 'Failed to load products. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter products by category
  useEffect(() => {
    if (selectedCategoryFilter === 'all') {
      setFilteredProducts(products);
    } else if (selectedCategoryFilter === 'uncategorized') {
      setFilteredProducts(products.filter(product => !product.categoryId));
    } else {
      setFilteredProducts(products.filter(product => product.categoryId === selectedCategoryFilter));
    }
  }, [products, selectedCategoryFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return null;
    return categories.find(c => c.id === categoryId);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setSubmitError('Product name is required');
      return;
    }
    
    if (formData.price < 0) {
      setSubmitError('Price cannot be negative');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct = await productStorage.update(editingProduct.id, formData);
        if (updatedProduct) {
          setProducts(prev => 
            prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
          );
          // Show success message or toast here if needed
        } else {
          throw new Error('Failed to update product');
        }
      } else {
        // Create new product
        const newProduct = await productStorage.create(formData);
        setProducts(prev => [...prev, newProduct]);
        // Show success message or toast here if needed
      }
      
      // Reset form and close dialog
      setFormData({ name: '', price: 0, categoryId: '' });
      setEditingProduct(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while saving the product. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const success = await productStorage.delete(id);
        if (success) {
          setProducts(prev => prev.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="all">Todas las categorías</option>
              <option value="uncategorized">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProduct(null);
              setFormData({ name: '', price: 0, categoryId: '' });
              setSubmitError(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit' : 'Add New'} Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                    {submitError}
                  </div>
                )}
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full p-2 border rounded"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
                    Category (Optional)
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingProduct(null);
                      setFormData({ name: '', price: 0, categoryId: '' });
                      setSubmitError(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingProduct ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>{editingProduct ? 'Update' : 'Create'} Product</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No products found. Add your first product to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <li key={product.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
                    </div>
                    {(() => {
                      const category = getCategoryName(product.categoryId);
                      if (category) {
                        return (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: `${category.color || '#e5e7eb'}33`,
                              color: category.color || '#6b7280',
                              border: `1px solid ${category.color || '#e5e7eb'}`,
                              marginRight: '0.25rem',
                              marginBottom: '0.25rem'
                            }}
                          >
                            {category.name}
                          </span>
                        );
                      }
                      return (
                        <span className="text-xs text-gray-500">Sin categoría</span>
                      );
                    })()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
