'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ShoppingBag } from 'lucide-react';
import { Customer, CreateCustomerInput } from '@/types/customer';
import { Product } from '@/types/product';
import { customerStorage, productStorage, activityStorage } from '@/lib/storage';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CreateCustomerInput>({ name: '', email: '' });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar todos los datos
  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando carga de datos...');
      
      // Cargar clientes y productos en paralelo
      const [loadedCustomers, loadedProducts] = await Promise.all([
        customerStorage.getAll().catch(err => {
          console.error('Error cargando clientes:', err);
          return [];
        }),
        productStorage.getAll().catch(err => {
          console.error('Error cargando productos:', err);
          return [];
        })
      ]);
      
      console.log('Clientes cargados:', loadedCustomers);
      console.log('Productos cargados:', loadedProducts);
      
      // Verificar la estructura de los clientes
      if (loadedCustomers && loadedCustomers.length > 0) {
        console.log('Primer cliente:', loadedCustomers[0]);
        console.log('Productos del primer cliente:', loadedCustomers[0]?.purchasedProducts);
      } else {
        console.log('No se encontraron clientes');
      }
      
      setCustomers(loadedCustomers || []);
      setProducts(loadedProducts || []);
      
      return { customers: loadedCustomers, products: loadedProducts };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar los datos';
      console.error('Error loading data:', error);
      setError(errorMessage);
      return { customers: [], products: [] };
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData().catch(console.error);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        // Actualizar cliente existente
        await customerStorage.update(editingCustomer.id, formData);
      } else {
        // Crear nuevo cliente
        await customerStorage.create(formData);
      }
      
      // Recargar datos para asegurar consistencia
      await loadAllData();
      
      // Resetear formulario y cerrar diálogo
      setFormData({ name: '', email: '' });
      setEditingCustomer(null);
      setIsDialogOpen(false);
      
      // Mostrar notificación de éxito
      alert(editingCustomer ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
    } catch (error) {
      console.error('Error saving customer:', error);
      alert(`Error al guardar el cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const success = await customerStorage.delete(id);
        if (success) {
          setCustomers(prev => prev.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handlePurchase = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPurchaseDialogOpen(true);
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedProductId) {
      alert('Por favor, seleccione un cliente y un producto');
      return;
    }
    
    try {
      const product = await productStorage.getById(selectedProductId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      
      // Añadir producto al cliente
      await customerStorage.addProductToCustomer(selectedCustomer.id, selectedProductId);
      
      // Registrar la actividad
      await activityStorage.logPurchase(selectedCustomer, product, `Compra de ${product.name}`);
      
      // Recargar todos los datos para asegurar consistencia
      await loadAllData();
      
      // Resetear estado
      setSelectedProductId('');
      setIsPurchaseDialogOpen(false);
      
      // Mostrar notificación de éxito
      alert(`Compra registrada correctamente para ${selectedCustomer.name}`);
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert(`Error al procesar la compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleRemoveProduct = async (customerId: string, productId: string) => {
    if (!window.confirm('¿Está seguro de eliminar este producto del cliente?')) {
      return;
    }
    
    try {
      const success = await customerStorage.removeProductFromCustomer(customerId, productId);
      if (success) {
        // Recargar todos los datos
        await loadAllData();
        alert('Producto eliminado correctamente del cliente');
      } else {
        throw new Error('No se pudo eliminar el producto');
      }
    } catch (error) {
      console.error('Error removing product:', error);
      alert(`Error al eliminar el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Debug: Verificar los clientes antes de renderizar
  console.log('Clientes antes de renderizar:', customers);
  
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

      {/* Mostrar estado de carga */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando clientes...</p>
        </div>
      )}

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar lista de clientes o mensaje de "sin clientes" */}
      {!isLoading && customers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No se encontraron clientes. Agrega tu primer cliente para comenzar.</p>
          <Button 
            className="mt-4"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Agregar Cliente
          </Button>
        </div>
      )}

    {/* Mostrar mensaje de error si existe */}
    {error && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Mostrar mensaje cuando no hay clientes */}
    {!isLoading && customers.length === 0 && (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No se encontraron clientes. Usa el botón "Add Customer" en la parte superior para agregar un nuevo cliente.</p>
      </div>
    )}
    {/* Mostrar lista de clientes */}
    {!isLoading && customers.length > 0 && (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {customers.map((customer) => (
            <li key={customer.id} className="px-4 py-4 sm:px-6">
              <div className="flex flex-col space-y-2">
                {/* Customer header */}
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
                
                {/* Purchased products list */}
                {customer.purchasedProducts && customer.purchasedProducts.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Productos adquiridos:</h4>
                    <ul className="space-y-3">
                      {customer.purchasedProducts.map(product => (
                        <li key={product.id} className="bg-gray-50 rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-900">{product.name}</span>
                                {product.categories && product.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {product.categories.map(category => (
                                      <span 
                                        key={category.id}
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {category.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">${product.price?.toFixed(2) || '0.00'}</div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProduct(customer.id, product.id);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
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
