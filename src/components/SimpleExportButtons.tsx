'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Package, Users } from 'lucide-react';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { exportProducts, exportCustomers, exportCompleteReport } from '@/lib/export-utils';

interface ExportProductsButtonProps {
  products: Product[];
  className?: string;
}

interface ExportCustomersButtonProps {
  customers: Customer[];
  className?: string;
}

interface ExportReportButtonProps {
  products: Product[];
  customers: Customer[];
  className?: string;
}

export function ExportProductsButton({ products, className = '' }: ExportProductsButtonProps) {
  const handleExport = () => {
    try {
      exportProducts(products);
      console.log('Productos exportados exitosamente');
    } catch (error) {
      console.error('Error al exportar productos:', error);
      alert('Error al exportar productos');
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Button 
      onClick={handleExport}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      <Package className="w-4 h-4" />
      Exportar Productos
    </Button>
  );
}

export function ExportCustomersButton({ customers, className = '' }: ExportCustomersButtonProps) {
  const handleExport = () => {
    try {
      exportCustomers(customers);
      console.log('Clientes exportados exitosamente');
    } catch (error) {
      console.error('Error al exportar clientes:', error);
      alert('Error al exportar clientes');
    }
  };

  if (!customers || customers.length === 0) {
    return null;
  }

  return (
    <Button 
      onClick={handleExport}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
    >
      <Users className="w-4 h-4" />
      Exportar Clientes
    </Button>
  );
}

export function ExportReportButton({ products, customers, className = '' }: ExportReportButtonProps) {
  const handleExport = () => {
    try {
      exportCompleteReport(products, customers);
      console.log('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al exportar reporte');
    }
  };

  const hasData = (products && products.length > 0) || (customers && customers.length > 0);

  if (!hasData) {
    return null;
  }

  return (
    <Button 
      onClick={handleExport}
      variant="secondary"
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      Exportar Reporte
    </Button>
  );
}
