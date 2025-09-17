import { Product } from '@/types/product';
import { Customer } from '@/types/customer';

/**
 * Función simple para exportar datos a CSV (como alternativa temporal)
 * @param data - Array de objetos a exportar
 * @param fileName - Nombre del archivo
 */
function exportToCSV(data: any[], fileName: string): void {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar.');
  }

  // Obtener las columnas del primer objeto
  const headers = Object.keys(data[0]);
  
  // Crear el contenido CSV
  const csvContent = [
    // Encabezados
    headers.join(','),
    // Datos
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Crear y descargar el archivo
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.replace('.xlsx', '.csv'));
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Función para exportar productos (versión simple)
 */
export function exportarProductosAExcel(products: Product[], fileName?: string): void {
  if (!products || products.length === 0) {
    throw new Error('No hay productos disponibles para exportar.');
  }

  const productosParaExportar = products.map((product, index) => ({
    'Número': index + 1,
    'ID del Producto': product.id,
    'Nombre del Producto': product.name,
    'Precio (€)': product.price.toFixed(2),
    'Fecha de Exportación': new Date().toLocaleDateString('es-ES'),
  }));

  const nombreArchivo = fileName || `productos_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(productosParaExportar, nombreArchivo);
}

/**
 * Función para exportar clientes (versión simple)
 */
export function exportarClientesAExcel(customers: Customer[], fileName?: string): void {
  if (!customers || customers.length === 0) {
    throw new Error('No hay clientes disponibles para exportar.');
  }

  const clientesParaExportar = customers.map((customer, index) => ({
    'Número': index + 1,
    'ID del Cliente': customer.id,
    'Nombre del Cliente': customer.name,
    'Correo Electrónico': customer.email,
    'Productos Comprados': customer.purchasedProducts.length,
    'Lista de Productos': customer.purchasedProducts.map(p => p.name).join('; ') || 'Ninguno',
    'Total Gastado (€)': customer.purchasedProducts.reduce((total, product) => total + product.price, 0).toFixed(2),
    'Fecha de Exportación': new Date().toLocaleDateString('es-ES'),
  }));

  const nombreArchivo = fileName || `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(clientesParaExportar, nombreArchivo);
}

/**
 * Función para exportar reporte completo (versión simple)
 */
export function exportarReporteCompleto(
  products: Product[], 
  customers: Customer[], 
  fileName?: string
): void {
  // Por ahora, exportamos los clientes que incluyen información más completa
  if (customers && customers.length > 0) {
    exportarClientesAExcel(customers, fileName || `reporte_completo_${new Date().toISOString().split('T')[0]}.csv`);
  } else if (products && products.length > 0) {
    exportarProductosAExcel(products, fileName || `reporte_productos_${new Date().toISOString().split('T')[0]}.csv`);
  } else {
    throw new Error('No hay datos disponibles para exportar.');
  }
}

/**
 * Función para validar soporte de descarga
 */
export function validarSoporteDescarga(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         typeof URL !== 'undefined' && 
         typeof Blob !== 'undefined';
}
