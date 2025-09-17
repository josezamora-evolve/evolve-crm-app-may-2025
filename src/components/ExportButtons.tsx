'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Package, Users, FileSpreadsheet } from 'lucide-react';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { 
  exportarProductosAExcel, 
  exportarClientesAExcel, 
  exportarReporteCompleto 
} from '@/lib/excel-export';

interface ExportProductsButtonProps {
  products: Product[];
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

interface ExportCustomersButtonProps {
  customers: Customer[];
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

interface ExportCompleteReportButtonProps {
  products: Product[];
  customers: Customer[];
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  buttonText?: string;
}

/**
 * Botón para exportar productos
 */
export function ExportProductsButton({ 
  products, 
  className = '', 
  variant = 'outline',
  size = 'default'
}: ExportProductsButtonProps) {
  const handleExport = () => {
    try {
      exportarProductosAExcel(products);
    } catch (error) {
      console.error('Error al exportar productos:', error);
      alert('Error al exportar productos. Por favor, inténtalo de nuevo.');
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Button 
      onClick={handleExport}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <Package className="w-4 h-4" />
      Exportar Productos
    </Button>
  );
}

/**
 * Botón para exportar clientes
 */
export function ExportCustomersButton({ 
  customers, 
  className = '', 
  variant = 'outline',
  size = 'default'
}: ExportCustomersButtonProps) {
  const handleExport = () => {
    try {
      exportarClientesAExcel(customers);
    } catch (error) {
      console.error('Error al exportar clientes:', error);
      alert('Error al exportar clientes. Por favor, inténtalo de nuevo.');
    }
  };

  if (!customers || customers.length === 0) {
    return null;
  }

  return (
    <Button 
      onClick={handleExport}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <Users className="w-4 h-4" />
      Exportar Clientes
    </Button>
  );
}

/**
 * Botón para exportar reporte completo
 */
export function ExportCompleteReportButton({ 
  products, 
  customers, 
  className = '', 
  variant = 'secondary',
  size = 'default',
  buttonText = 'Reporte Completo'
}: ExportCompleteReportButtonProps) {
  const handleExport = () => {
    try {
      exportarReporteCompleto(products, customers);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al exportar reporte. Por favor, inténtalo de nuevo.');
    }
  };

  const hasData = (products && products.length > 0) || (customers && customers.length > 0);

  if (!hasData) {
    return null;
  }

  return (
    <Button 
      onClick={handleExport}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <FileSpreadsheet className="w-4 h-4" />
      {buttonText}
    </Button>
  );
}
