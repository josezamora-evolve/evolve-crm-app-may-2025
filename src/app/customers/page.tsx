'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ShoppingBag } from 'lucide-react';
import { Customer, CreateCustomerInput } from '@/types/customer';
import { Product } from '@/types/product';
import { customerStorage, productStorage } from '@/lib/storage';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CreateCustomerInput>({ name: '', email: '' });
  const [selectedProductId, setSelectedProductId] = useState('');

  // Load data from local storage
  useEffect(() => {
    setCustomers(customerStorage.getAll());
    setProducts(productStorage.getAll());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      // Update existing customer
      const updatedCustomer = customerStorage.update(editingCustomer.id, formData);
      if (updatedCustomer) {
        setCustomers(prev => 
          prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
        );
      }
    } else {
      // Create new customer
      const newCustomer = customerStorage.create(formData);
      setCustomers(prev => [...prev, newCustomer]);
    }
    
    // Reset form and close dialog
    setFormData({ name: '', email: '' });
    setEditingCustomer(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      if (customerStorage.delete(id)) {
        setCustomers(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCustomer && selectedProductId) {
      if (customerStorage.addProductToCustomer(selectedCustomer.id, selectedProductId)) {
        // Refresh customers list
        setCustomers(customerStorage.getAll());
        setSelectedProductId('');
        setIsPurchaseDialogOpen(false);
      }
    }
  };

  const handleRemoveProduct = (customerId: string, productId: string) => {
    if (window.confirm('Remove this product from the customer?')) {
      if (customerStorage.removeProductFromCustomer(customerId, productId)) {
        // Refresh customers list
        setCustomers(customerStorage.getAll());
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCustomer(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCustomer ? 'Update' : 'Create'} Customer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Purchase Product Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePurchaseSubmit} className="space-y-4">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                Select Product
              </label>
              <select
                id="product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                required
              >
                <option value="">Select a product</option>
                {products
                  .filter(product => 
                    !selectedCustomer?.purchasedProducts.some(p => p.id === product.id)
                  )
                  .map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${product.price.toFixed(2)})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPurchaseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedProductId}>
                Add Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {customers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No customers found. Add your first customer to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <li key={customer.id} className="px-4 py-4 sm:px-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsPurchaseDialogOpen(true);
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" /> Add Product
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {customer.purchasedProducts.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Purchased Products:</h4>
                      <ul className="space-y-1">
                        {customer.purchasedProducts.map(product => (
                          <li key={product.id} className="flex justify-between items-center text-sm">
                            <span>
                              {product.name} - ${product.price.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(customer.id, product.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
