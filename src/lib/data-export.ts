import { Product } from '@/types/product';
import { Customer } from '@/types/customer';

/**
 * Configuración para la exportación de datos
 */
const EXPORT_CONFIG = {
  // Formato de fecha español
  dateFormat: 'es-ES',
  // Codificación UTF-8 BOM para Excel
  encoding: '\ufeff',
  // Tipo MIME para CSV
  mimeType: 'text/csv;charset=utf-8;',
};

/**
 * Función utilitaria para formatear valores CSV
 * @param value - Valor a formatear
 * @returns Valor formateado para CSV
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Si contiene comas, comillas o saltos de línea, envolver en comillas
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Función utilitaria para descargar datos como archivo CSV
 * @param data - Array de objetos a exportar
 * @param filename - Nombre del archivo
 * @param successMessage - Mensaje de éxito opcional
 */
function downloadCSV(data: any[], filename: string, successMessage?: string): void {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  try {
    // Obtener las claves del primer objeto como encabezados
    const headers = Object.keys(data[0]);
    
    // Convertir datos a formato CSV
    const csvContent = [
      headers.join(','), // Encabezados
      ...data.map(row => 
        headers.map(header => formatCSVValue(row[header])).join(',')
      )
    ].join('\n');

    // Crear blob con codificación UTF-8 BOM para compatibilidad con Excel
    const blob = new Blob([EXPORT_CONFIG.encoding + csvContent], { 
      type: EXPORT_CONFIG.mimeType 
    });
    
    // Crear enlace temporal para descarga
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    
    // Ejecutar descarga
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar URL temporal
    URL.revokeObjectURL(link.href);
    
    // Mostrar mensaje de éxito si se proporciona
    if (successMessage) {
      console.log(`✅ ${successMessage}`);
    }
    
  } catch (error) {
    console.error('❌ Error al exportar datos:', error);
    throw new Error('Error al generar el archivo de exportación');
  }
}

/**
 * Exportar productos a Excel/CSV
 * @param products - Array de productos a exportar
 * @param fileName - Nombre personalizado del archivo (opcional)
 */
export function exportarProductosAExcel(products: Product[], fileName?: string): void {
  if (!products || products.length === 0) {
    throw new Error('No hay productos disponibles para exportar.');
  }

  const data = products.map((product, index) => ({
    'N°': index + 1,
    'ID del Producto': product.id,
    'Nombre del Producto': product.name,
    'Precio (€)': product.price.toFixed(2),
    'Fecha de Exportación': new Date().toLocaleDateString(EXPORT_CONFIG.dateFormat)
  }));

  const filename = fileName || `productos_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(data, filename, 'Productos exportados exitosamente');
}

/**
 * Exportar clientes a Excel/CSV
 * @param customers - Array de clientes a exportar
 * @param fileName - Nombre personalizado del archivo (opcional)
 */
export function exportarClientesAExcel(customers: Customer[], fileName?: string): void {
  if (!customers || customers.length === 0) {
    throw new Error('No hay clientes disponibles para exportar.');
  }

  const data = customers.map((customer, index) => ({
    'N°': index + 1,
    'ID del Cliente': customer.id,
    'Nombre del Cliente': customer.name,
    'Correo Electrónico': customer.email,
    'Productos Comprados': customer.purchasedProducts.length,
    'Lista de Productos': customer.purchasedProducts.map(p => p.name).join('; ') || 'Ninguno',
    'Total Gastado (€)': customer.purchasedProducts.reduce((total, product) => total + product.price, 0).toFixed(2),
    'Fecha de Exportación': new Date().toLocaleDateString(EXPORT_CONFIG.dateFormat)
  }));

  const filename = fileName || `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(data, filename, 'Clientes exportados exitosamente');
}

/**
 * Exportar reporte completo con productos y clientes
 * @param products - Array de productos
 * @param customers - Array de clientes
 * @param fileName - Nombre personalizado del archivo (opcional)
 */
export function exportarReporteCompleto(
  products: Product[], 
  customers: Customer[], 
  fileName?: string
): void {
  if ((!products || products.length === 0) && (!customers || customers.length === 0)) {
    throw new Error('No hay datos disponibles para exportar.');
  }

  // Crear un reporte combinado con resumen
  const reportData = [];

  // Agregar resumen
  reportData.push({
    'Tipo': 'RESUMEN',
    'Descripción': 'Total de Productos',
    'Cantidad': products?.length || 0,
    'Valor': '',
    'Fecha': new Date().toLocaleDateString(EXPORT_CONFIG.dateFormat)
  });

  reportData.push({
    'Tipo': 'RESUMEN',
    'Descripción': 'Total de Clientes',
    'Cantidad': customers?.length || 0,
    'Valor': '',
    'Fecha': new Date().toLocaleDateString(EXPORT_CONFIG.dateFormat)
  });

  // Agregar productos si existen
  if (products && products.length > 0) {
    products.forEach((product, index) => {
      reportData.push({
        'Tipo': 'PRODUCTO',
        'Descripción': product.name,
        'Cantidad': 1,
        'Valor': `€${product.price.toFixed(2)}`,
        'Fecha': new Date().toLocaleDateString(EXPORT_CONFIG.dateFormat)
      });
    });
  }

  // Agregar clientes si existen
  if (customers && customers.length > 0) {
    customers.forEach((customer, index) => {
      const totalGastado = customer.purchasedProducts.reduce((sum, p) => sum + p.price, 0);
      reportData.push({
        'Tipo': 'CLIENTE',
        'Descripción': `${customer.name} (${customer.email})`,
        'Cantidad': customer.purchasedProducts.length,
        'Valor': `€${totalGastado.toFixed(2)}`,
        'Fecha': new Date().toLocaleDateString(EXPORT_CONFIG.dateFormat)
      });
    });
  }

  const filename = fileName || `reporte_completo_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(reportData, filename, 'Reporte completo exportado exitosamente');
}

/**
 * Validar si el navegador soporta la descarga de archivos
 */
export function validarSoporteDescarga(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         typeof URL !== 'undefined' && 
         typeof Blob !== 'undefined';
}
