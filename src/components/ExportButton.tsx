'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  exportarProductosAExcel, 
  exportarClientesAExcel, 
  exportarReporteCompleto,
  validarSoporteDescarga
} from '@/lib/export-functions';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';

/**
 * Props para el componente ExportButton
 */
interface ExportButtonProps {
  /** Tipo de exportación */
  type: 'products' | 'customers' | 'complete';
  /** Datos a exportar */
  data?: Product[] | Customer[];
  /** Datos adicionales para reporte completo */
  additionalData?: Product[] | Customer[];
  /** Texto personalizado del botón */
  buttonText?: string;
  /** Nombre personalizado del archivo */
  fileName?: string;
  /** Variante del botón */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Tamaño del botón */
  size?: 'default' | 'sm' | 'lg';
  /** Clase CSS adicional */
  className?: string;
  /** Función callback después de la exportación exitosa */
  onExportSuccess?: () => void;
  /** Función callback en caso de error */
  onExportError?: (error: string) => void;
}

/**
 * Componente reutilizable para botones de exportación a Excel
 */
export function ExportButton({
  type,
  data = [],
  additionalData = [],
  buttonText,
  fileName,
  variant = 'outline',
  size = 'default',
  className = '',
  onExportSuccess,
  onExportError
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Obtiene el icono apropiado según el tipo de exportación
   */
  const getIcon = () => {
    switch (type) {
      case 'products':
        return <Package className="w-4 h-4" />;
      case 'customers':
        return <Users className="w-4 h-4" />;
      case 'complete':
        return <FileSpreadsheet className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  /**
   * Obtiene el texto por defecto del botón según el tipo
   */
  const getDefaultButtonText = () => {
    switch (type) {
      case 'products':
        return 'Exportar Productos';
      case 'customers':
        return 'Exportar Clientes';
      case 'complete':
        return 'Exportar Reporte Completo';
      default:
        return 'Exportar Datos';
    }
  };

  /**
   * Maneja el proceso de exportación
   */
  const handleExport = () => {
    // Validar soporte del navegador
    if (!validarSoporteDescarga()) {
      const errorMsg = 'Tu navegador no soporta la descarga de archivos.';
      onExportError?.(errorMsg);
      return;
    }

    setIsExporting(true);

    try {
      switch (type) {
        case 'products':
          if (!data || data.length === 0) {
            throw new Error('No hay productos disponibles para exportar.');
          }
          exportarProductosAExcel(data as Product[], fileName);
          break;

        case 'customers':
          if (!data || data.length === 0) {
            throw new Error('No hay clientes disponibles para exportar.');
          }
          exportarClientesAExcel(data as Customer[], fileName);
          break;

        case 'complete':
          const products = data as Product[] || [];
          const customers = additionalData as Customer[] || [];
          
          if (products.length === 0 && customers.length === 0) {
            throw new Error('No hay datos disponibles para exportar.');
          }
          
          exportarReporteCompleto(products, customers, fileName);
          break;

        default:
          throw new Error('Tipo de exportación no válido.');
      }

      // Callback de éxito
      onExportSuccess?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al exportar.';
      console.error('Error en exportación:', errorMessage);
      onExportError?.(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      {isExporting ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          {getIcon()}
          {buttonText || getDefaultButtonText()}
        </>
      )}
    </Button>
  );
}

/**
 * Componente específico para exportar productos
 */
export function ExportProductsButton({
  products,
  fileName,
  ...props
}: {
  products: Product[];
  fileName?: string;
} & Omit<ExportButtonProps, 'type' | 'data'>) {
  return (
    <ExportButton
      type="products"
      data={products}
      fileName={fileName}
      {...props}
    />
  );
}

/**
 * Componente específico para exportar clientes
 */
export function ExportCustomersButton({
  customers,
  fileName,
  ...props
}: {
  customers: Customer[];
  fileName?: string;
} & Omit<ExportButtonProps, 'type' | 'data'>) {
  return (
    <ExportButton
      type="customers"
      data={customers}
      fileName={fileName}
      {...props}
    />
  );
}

/**
 * Componente específico para exportar reporte completo
 */
export function ExportCompleteReportButton({
  products,
  customers,
  fileName,
  ...props
}: {
  products: Product[];
  customers: Customer[];
  fileName?: string;
} & Omit<ExportButtonProps, 'type' | 'data' | 'additionalData'>) {
  return (
    <ExportButton
      type="complete"
      data={products}
      additionalData={customers}
      fileName={fileName}
      {...props}
    />
  );
}
