import { Product } from '@/types/product';
import { Customer } from '@/types/customer';

/**
 * Función utilitaria para descargar datos como archivo CSV
 */
function downloadCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Obtener las claves del primer objeto como encabezados
  const headers = Object.keys(data[0]);
  
  // Convertir datos a formato CSV
  const csvContent = [
    headers.join(','), // Encabezados
    ...data.map(row => 
      headers.map(header => {
        let value = row[header];
        // Manejar valores que contienen comas o comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
}

/**
 * Exportar productos a CSV
 */
export function exportProducts(products: Product[]): void {
  if (!products || products.length === 0) {
    alert('No hay productos para exportar');
    return;
  }

  const data = products.map((product, index) => ({
    'Número': index + 1,
    'ID': product.id,
    'Nombre': product.name,
    'Precio': `€${product.price.toFixed(2)}`,
    'Fecha': new Date().toLocaleDateString('es-ES')
  }));

  const filename = `productos_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(data, filename);
}

/**
 * Exportar clientes a CSV
 */
export function exportCustomers(customers: Customer[]): void {
  if (!customers || customers.length === 0) {
    alert('No hay clientes para exportar');
    return;
  }

  const data = customers.map((customer, index) => ({
    'Número': index + 1,
    'ID': customer.id,
    'Nombre': customer.name,
    'Email': customer.email,
    'Productos Comprados': customer.purchasedProducts.length,
    'Total Gastado': `€${customer.purchasedProducts.reduce((sum, p) => sum + p.price, 0).toFixed(2)}`,
    'Fecha': new Date().toLocaleDateString('es-ES')
  }));

  const filename = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(data, filename);
}

/**
 * Exportar reporte completo
 */
export function exportCompleteReport(products: Product[], customers: Customer[]): void {
  if ((!products || products.length === 0) && (!customers || customers.length === 0)) {
    alert('No hay datos para exportar');
    return;
  }

  // Por simplicidad, exportamos los clientes si existen, sino los productos
  if (customers && customers.length > 0) {
    exportCustomers(customers);
  } else {
    exportProducts(products);
  }
}
