'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ExportProductsButton, 
  ExportCustomersButton, 
  ExportReportButton 
} from '@/components/SimpleExportButtons';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { productStorage, customerStorage } from '@/lib/storage';
import { Plus, Package, Users, FileSpreadsheet } from 'lucide-react';

export default function ExportDemoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Cargar datos desde el almacenamiento local
  useEffect(() => {
    setProducts(productStorage.getAll());
    setCustomers(customerStorage.getAll());
  }, []);

  // Función para crear datos de ejemplo
  const createSampleData = () => {
    // Crear productos de ejemplo
    const sampleProducts = [
      { name: 'Laptop HP Pavilion', price: 899.99 },
      { name: 'Mouse Inalámbrico Logitech', price: 29.99 },
      { name: 'Teclado Mecánico RGB', price: 149.99 },
      { name: 'Monitor 24" Full HD', price: 199.99 },
      { name: 'Auriculares Bluetooth', price: 79.99 }
    ];

    const createdProducts: Product[] = [];
    sampleProducts.forEach(product => {
      const newProduct = productStorage.create(product);
      createdProducts.push(newProduct);
    });

    // Crear clientes de ejemplo
    const sampleCustomers = [
      { name: 'María García', email: 'maria.garcia@email.com' },
      { name: 'Juan Pérez', email: 'juan.perez@email.com' },
      { name: 'Ana López', email: 'ana.lopez@email.com' },
      { name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com' }
    ];

    sampleCustomers.forEach((customer, index) => {
      const newCustomer = customerStorage.create(customer);
      
      // Asignar algunos productos a los clientes
      if (index < createdProducts.length) {
        customerStorage.addProductToCustomer(newCustomer.id, createdProducts[index].id);
        if (index + 1 < createdProducts.length) {
          customerStorage.addProductToCustomer(newCustomer.id, createdProducts[index + 1].id);
        }
      }
    });

    // Actualizar el estado
    setProducts(productStorage.getAll());
    setCustomers(customerStorage.getAll());
  };

  // Función para limpiar todos los datos
  const clearAllData = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos de ejemplo?')) {
      // Eliminar todos los productos
      products.forEach(product => productStorage.delete(product.id));
      
      // Eliminar todos los clientes
      customers.forEach(customer => customerStorage.delete(customer.id));
      
      // Actualizar el estado
      setProducts([]);
      setCustomers([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Demo de Exportación a Excel
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Prueba la funcionalidad de exportación de datos a Excel. 
          Crea datos de ejemplo y exporta productos, clientes o reportes completos.
        </p>
      </div>

      {/* Sección de gestión de datos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Gestión de Datos de Ejemplo</h2>
        <div className="flex gap-4 flex-wrap">
          <Button 
            onClick={createSampleData}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Datos de Ejemplo
          </Button>
          <Button 
            onClick={clearAllData}
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Package className="w-4 h-4" />
            Limpiar Todos los Datos
          </Button>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Productos</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            <p className="text-sm text-blue-700">productos registrados</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Clientes</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{customers.length}</p>
            <p className="text-sm text-green-700">clientes registrados</p>
          </div>
        </div>
      </div>

      {/* Sección de exportación */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Opciones de Exportación</h2>
        
        {products.length === 0 && customers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              No hay datos para exportar. Crea algunos datos de ejemplo primero.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exportar Productos */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Exportar Productos</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Exporta la lista completa de productos con sus precios y detalles.
              </p>
              <ExportProductsButton
                products={products}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                {products.length} productos disponibles
              </p>
            </div>

            {/* Exportar Clientes */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-medium">Exportar Clientes</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Exporta la lista de clientes con sus compras y totales gastados.
              </p>
              <ExportCustomersButton
                customers={customers}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                {customers.length} clientes disponibles
              </p>
            </div>

            {/* Reporte Completo */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium">Reporte Completo</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Exporta un archivo Excel con múltiples hojas: productos, clientes y resumen.
              </p>
              <ExportReportButton
                products={products}
                customers={customers}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Incluye {products.length} productos y {customers.length} clientes
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Información técnica */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Información Técnica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Características de la Exportación</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Formato Excel (.xlsx) compatible</li>
              <li>• Codificación UTF-8 para caracteres especiales</li>
              <li>• Encabezados automáticos en español</li>
              <li>• Nombres de archivo con fecha automática</li>
              <li>• Validación de datos antes de exportar</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Funciones Disponibles</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>exportarProductosAExcel()</code></li>
              <li>• <code>exportarClientesAExcel()</code></li>
              <li>• <code>exportarReporteCompleto()</code></li>
              <li>• Componentes reutilizables de botones</li>
              <li>• Manejo de errores y validaciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
