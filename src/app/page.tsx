'use client';

import { useEffect, useState } from 'react';
import { Package, Users, DollarSign, TrendingUp } from 'lucide-react';
import { analytics } from '@/lib/storage';
import { StatCard } from '@/components/dashboard/StatCard';
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    mostSoldProducts: [] as Array<{ product: { name: string }; salesCount: number }>,
  });

  useEffect(() => {
    const loadStats = () => {
      const totalProducts = analytics.getTotalProducts();
      const totalCustomers = analytics.getTotalCustomers();
      const totalRevenue = analytics.getTotalRevenue();
      const mostSoldProducts = analytics.getMostSoldProducts(5);

      setStats({
        totalProducts,
        totalCustomers,
        totalRevenue,
        mostSoldProducts,
      });
    };

    loadStats();
    // Actualizar stats cuando cambie el localStorage
    const handleStorageChange = () => loadStats();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const chartData = stats.mostSoldProducts.map(item => ({
    name: item.product.name,
    value: item.salesCount,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Resumen general de tu CRM</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Productos"
            value={stats.totalProducts}
            icon={Package}
          />
          <StatCard
            title="Total Clientes"
            value={stats.totalCustomers}
            icon={Users}
          />
          <StatCard
            title="Ingresos Totales"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Productos Vendidos"
            value={stats.mostSoldProducts.reduce((acc, item) => acc + item.salesCount, 0)}
            icon={TrendingUp}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SimpleBarChart
            title="Productos Más Vendidos"
            data={chartData}
          />
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Resumen Rápido
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Promedio por cliente:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${stats.totalCustomers > 0 ? (stats.totalRevenue / stats.totalCustomers).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Productos por cliente:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalCustomers > 0 
                      ? (stats.mostSoldProducts.reduce((acc, item) => acc + item.salesCount, 0) / stats.totalCustomers).toFixed(1)
                      : '0.0'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio promedio:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${stats.mostSoldProducts.length > 0 
                      ? (stats.totalRevenue / stats.mostSoldProducts.reduce((acc, item) => acc + item.salesCount, 0)).toFixed(2)
                      : '0.00'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
