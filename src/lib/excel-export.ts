import { Product } from '@/types/product';
import { Customer } from '@/types/customer';

/**
 * Función para cargar XLSX dinámicamente
 */
async function loadXLSX() {
  if (typeof window === 'undefined') {
    throw new Error('La exportación solo está disponible en el navegador');
  }
  
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
  return XLSX;
}

// Variable global para XLSX
let XLSX: any = null;

/**
 * Configuración general para la exportación de Excel
 */
const EXCEL_CONFIG = {
  // Configuración de codificación para soportar caracteres especiales
  bookType: 'xlsx' as const,
  compression: true,
  // Configuración para caracteres especiales (UTF-8)
  codepage: 65001,
};

/**
 * Interfaz para definir la estructura de datos que se exportará
 */
interface ExportData {
  data: any[];
  sheetName: string;
  fileName: string;
}

/**
 * Función utilitaria para crear y descargar un archivo Excel
 * @param exportData - Datos a exportar con configuración
 */
async function createAndDownloadExcel(exportData: ExportData): Promise<void> {
  try {
    // Cargar XLSX dinámicamente
    const xlsx = await loadXLSX();
    
    // Crear un nuevo libro de trabajo (workbook)
    const workbook = xlsx.utils.book_new();
    
    // Crear una hoja de trabajo (worksheet) a partir de los datos
    const worksheet = xlsx.utils.json_to_sheet(exportData.data);
    
    // Configurar el ancho automático de las columnas
    const columnWidths = exportData.data.length > 0 
      ? Object.keys(exportData.data[0]).map(key => ({
          wch: Math.max(key.length, 15) // Ancho mínimo de 15 caracteres
        }))
      : [];
    
    worksheet['!cols'] = columnWidths;
    
    // Agregar la hoja de trabajo al libro
    xlsx.utils.book_append_sheet(workbook, worksheet, exportData.sheetName);
    
    // Generar el archivo Excel en formato binario
    const excelBuffer = xlsx.write(workbook, {
      bookType: EXCEL_CONFIG.bookType,
      type: 'array',
      compression: EXCEL_CONFIG.compression,
    });
    
    // Crear un Blob con el contenido del archivo Excel
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportData.fileName;
    
    // Simular el clic para iniciar la descarga
    document.body.appendChild(link);
    link.click();
    
    // Limpiar el enlace temporal y liberar memoria
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ Archivo Excel exportado exitosamente: ${exportData.fileName}`);
  } catch (error) {
    console.error('❌ Error al exportar archivo Excel:', error);
    throw new Error('Error al generar el archivo Excel. Por favor, inténtelo de nuevo.');
  }
}

/**
 * Función para exportar lista de productos a Excel
 * @param products - Array de productos a exportar
 * @param fileName - Nombre personalizado del archivo (opcional)
 */
export async function exportarProductosAExcel(
  products: Product[], 
  fileName?: string
): Promise<void> {
  // Validar que existan productos para exportar
  if (!products || products.length === 0) {
    throw new Error('No hay productos disponibles para exportar.');
  }
  
  // Transformar los datos de productos para la exportación
  const productosParaExportar = products.map((product, index) => ({
    'N°': index + 1,
    'ID del Producto': product.id,
    'Nombre del Producto': product.name,
    'Precio (€)': product.price.toFixed(2),
    'Fecha de Exportación': new Date().toLocaleDateString('es-ES'),
  }));
  
  // Configurar los datos de exportación
  const exportData: ExportData = {
    data: productosParaExportar,
    sheetName: 'Lista de Productos',
    fileName: fileName || `productos_${new Date().toISOString().split('T')[0]}.xlsx`
  };
  
  // Ejecutar la exportación
  createAndDownloadExcel(exportData);
}

/**
 * Función para exportar lista de clientes a Excel
 * @param customers - Array de clientes a exportar
 * @param fileName - Nombre personalizado del archivo (opcional)
 */
export function exportarClientesAExcel(
  customers: Customer[], 
  fileName?: string
): void {
  // Validar que existan clientes para exportar
  if (!customers || customers.length === 0) {
    throw new Error('No hay clientes disponibles para exportar.');
  }
  
  // Transformar los datos de clientes para la exportación
  const clientesParaExportar = customers.map((customer, index) => ({
    'N°': index + 1,
    'ID del Cliente': customer.id,
    'Nombre del Cliente': customer.name,
    'Correo Electrónico': customer.email,
    'Productos Comprados': customer.purchasedProducts.length,
    'Lista de Productos': customer.purchasedProducts
      .map(product => product.name)
      .join(', ') || 'Ninguno',
    'Total Gastado (€)': customer.purchasedProducts
      .reduce((total, product) => total + product.price, 0)
      .toFixed(2),
    'Fecha de Exportación': new Date().toLocaleDateString('es-ES'),
  }));
  
  // Configurar los datos de exportación
  const exportData: ExportData = {
    data: clientesParaExportar,
    sheetName: 'Lista de Clientes',
    fileName: fileName || `clientes_${new Date().toISOString().split('T')[0]}.xlsx`
  };
  
  // Ejecutar la exportación
  createAndDownloadExcel(exportData);
}

/**
 * Función para exportar un reporte completo con productos y clientes
 * @param products - Array de productos
 * @param customers - Array de clientes
 * @param fileName - Nombre personalizado del archivo (opcional)
 */
export function exportarReporteCompleto(
  products: Product[],
  customers: Customer[],
  fileName?: string
): void {
  try {
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos de productos
    if (products && products.length > 0) {
      const productosParaExportar = products.map((product, index) => ({
        'N°': index + 1,
        'ID del Producto': product.id,
        'Nombre del Producto': product.name,
        'Precio (€)': product.price.toFixed(2),
      }));
      
      const worksheetProducts = XLSX.utils.json_to_sheet(productosParaExportar);
      XLSX.utils.book_append_sheet(workbook, worksheetProducts, 'Productos');
    }
    
    // Preparar datos de clientes
    if (customers && customers.length > 0) {
      const clientesParaExportar = customers.map((customer, index) => ({
        'N°': index + 1,
        'ID del Cliente': customer.id,
        'Nombre del Cliente': customer.name,
        'Correo Electrónico': customer.email,
        'Productos Comprados': customer.purchasedProducts.length,
        'Total Gastado (€)': customer.purchasedProducts
          .reduce((total, product) => total + product.price, 0)
          .toFixed(2),
      }));
      
      const worksheetCustomers = XLSX.utils.json_to_sheet(clientesParaExportar);
      XLSX.utils.book_append_sheet(workbook, worksheetCustomers, 'Clientes');
    }
    
    // Agregar hoja de resumen
    const resumen = [{
      'Métrica': 'Total de Productos',
      'Valor': products?.length || 0
    }, {
      'Métrica': 'Total de Clientes',
      'Valor': customers?.length || 0
    }, {
      'Métrica': 'Fecha de Reporte',
      'Valor': new Date().toLocaleDateString('es-ES')
    }];
    
    // Configurar los datos de exportación
    const exportData: ExportData = {
      data: resumen,
      sheetName: 'Resumen',
      fileName: fileName || `reporte_completo_${new Date().toISOString().split('T')[0]}.xlsx`
    };
    
    // Ejecutar la exportación
    createAndDownloadExcel(exportData);
  } catch (error) {
    console.error('❌ Error al exportar reporte completo:', error);
    throw new Error('Error al generar el reporte completo. Por favor, inténtelo de nuevo.');
  }
}

/**
 * Función utilitaria para validar si el navegador soporta la descarga de archivos
 */
export function validarSoporteDescarga(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         typeof URL !== 'undefined' && 
         typeof Blob !== 'undefined';
}
