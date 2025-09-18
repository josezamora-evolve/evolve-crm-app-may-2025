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
    mostSoldCategories: [] as Array<{ category: { name: string; color?: string }; salesCount: number }>,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('Cargando estadísticas...');
        const [
          totalProducts, 
          totalCustomers, 
          totalRevenue, 
          mostSoldProducts, 
          mostSoldCategories
        ] = await Promise.all([
          analytics.getTotalProducts(),
          analytics.getTotalCustomers(),
          analytics.getTotalRevenue(),
          analytics.getMostSoldProducts(5),
          analytics.getMostSoldCategories(5)
        ]);

        console.log('Datos cargados:', {
          totalProducts,
          totalCustomers,
          totalRevenue,
          mostSoldProducts,
          mostSoldCategories,
        });

        setStats({
          totalProducts,
          totalCustomers,
          totalRevenue,
          mostSoldProducts,
          mostSoldCategories,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  const productsChartData = stats.mostSoldProducts.map(item => ({
    name: item.product.name,
    value: item.salesCount,
  }));

  console.log('Preparando datos para el gráfico de categorías:', stats.mostSoldCategories);
  
  const categoriesChartData = stats.mostSoldCategories.map(item => {
    console.log('Procesando categoría:', {
      name: item.category.name,
      value: item.salesCount,
      color: item.category.color
    });
    
    return {
      name: item.category.name,
      value: item.salesCount,
      color: item.category.color || '#6b7280',
    };
  });

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

        {/* Quick Stats Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Resumen Rápido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-gray-500">Promedio por cliente</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  ${stats.totalCustomers > 0 ? (stats.totalRevenue / stats.totalCustomers).toFixed(2) : '0.00'}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-gray-500">Productos por cliente</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.totalCustomers > 0 
                    ? (stats.mostSoldProducts.reduce((acc, item) => acc + item.salesCount, 0) / stats.totalCustomers).toFixed(1)
                    : '0.0'}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-gray-500">Categorías con ventas</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {stats.mostSoldCategories.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Productos Más Vendidos
              </h3>
              {productsChartData.length > 0 ? (
                <div className="space-y-4">
                  {productsChartData.map((item, index) => {
                    const maxValue = Math.max(1, ...productsChartData.map(i => i.value || 0));
                    const percentage = ((item.value || 0) / maxValue * 100).toFixed(1);
                    const totalSales = productsChartData.reduce((sum, prod) => sum + (prod.value || 0), 0);
                    const percentageOfTotal = totalSales > 0 ? ((item.value || 0) / totalSales * 100).toFixed(1) : '0.0';
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <div 
                              className="h-3 w-3 rounded-full mr-2 flex-shrink-0 bg-blue-500"
                            />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {item.value} {item.value === 1 ? 'venta' : 'ventas'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full transition-all duration-500 ease-out bg-blue-500"
                            style={{
                              width: `${percentage}%`,
                              animation: 'progress 1.5s ease-in-out',
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {percentageOfTotal}% del total
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay datos de productos disponibles</p>
              )}
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Categorías Más Vendidas
              </h3>
              {categoriesChartData.length > 0 ? (
                <div className="space-y-4">
                  {categoriesChartData.map((item, index) => {
                    const category = stats.mostSoldCategories[index]?.category;
                    const maxValue = Math.max(1, ...categoriesChartData.map(i => i.value || 0));
                    const percentage = ((item.value || 0) / maxValue * 100).toFixed(1);
                    const totalSales = categoriesChartData.reduce((sum, cat) => sum + (cat.value || 0), 0);
                    const percentageOfTotal = totalSales > 0 ? ((item.value || 0) / totalSales * 100).toFixed(1) : '0.0';
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <div 
                              className="h-3 w-3 rounded-full mr-2 flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {item.value} {item.value === 1 ? 'venta' : 'ventas'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color,
                              animation: 'progress 1.5s ease-in-out',
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {percentageOfTotal}% del total
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay datos de categorías disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
