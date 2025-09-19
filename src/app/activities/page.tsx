'use client';

import { useEffect, useState } from 'react';
import { Activity } from '@/types/activity';
import { Category } from '@/types/category';
import { activityStorage, debugActivities } from '@/lib/storage';
import { customerStorage } from '@/lib/storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { categoryStorage } from '@/lib/storage';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [activityType, setActivityType] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const loadedCategories = await categoryStorage.getAll();
      console.log('Categorías cargadas (total:', loadedCategories.length, '):', loadedCategories);
      setCategories(loadedCategories);
      return loadedCategories; // Devolver las categorías cargadas
    } catch (error) {
      console.error('Error loading categories:', error);
      return []; // Devolver un array vacío en caso de error
    }
  };

  // Cargar actividades y categorías
  useEffect(() => {
    const loadData = async () => {
      // Primero cargar las categorías
      const loadedCategories = await loadCategories();
      console.log('Categorías disponibles para actividades:', loadedCategories);
      
      // Llamar a la función de depuración para ver todas las actividades
      try {
        console.log('=== INICIANDO VERIFICACIÓN DE ACTIVIDADES ===');
        await debugActivities.checkAllActivities();
      } catch (error) {
        console.error('Error en la verificación de actividades:', error);
      }
      
      // Luego cargar las actividades
      await loadActivities(loadedCategories);
    };
    
    loadData();
  }, [selectedCustomer, activityType]);

  const loadActivities = async (loadedCategories: Category[] = []) => {
    setIsLoading(true);
    try {
      let allActivities = await activityStorage.getAll();
      
      // Depuración: Ver las actividades cargadas
      console.log('=== TODAS LAS ACTIVIDADES CARGADAS ===');
      console.log('Total de actividades:', allActivities.length);
      allActivities.forEach(activity => {
        console.group(`Actividad ID: ${activity.id}`);
        console.log('Tipo:', activity.type);
        console.log('Cliente ID:', activity.customerId);
        console.log('Cliente:', activity.customerName);
        if (activity.product) {
          console.log('Producto:', activity.product.name);
          console.log('Categoría ID:', activity.product.categoryId);
          if (activity.product.categoryId) {
            const foundCategory = loadedCategories.find(c => c.id === activity.product?.categoryId);
            console.log('Categoría:', foundCategory);
          }
        } else {
          console.log('Sin producto asociado');
        }
        console.groupEnd();
      });
      
      // Mostrar valores actuales de los filtros
      console.log('=== FILTROS ACTUALES ===');
      console.log('Cliente seleccionado:', selectedCustomer);
      console.log('Tipo de actividad seleccionado:', activityType);
      
      // Filtrar por cliente si es necesario
      if (selectedCustomer !== 'all') {
        const beforeFilter = allActivities.length;
        allActivities = allActivities.filter(a => a.customerId === selectedCustomer);
        console.log(`Filtro por cliente: ${beforeFilter} -> ${allActivities.length} actividades`);
      }
      
      // Filtrar por tipo de actividad si es necesario
      if (activityType !== 'all') {
        const beforeFilter = allActivities.length;
        allActivities = allActivities.filter(a => a.type === activityType);
        console.log(`Filtro por tipo: ${beforeFilter} -> ${allActivities.length} actividades`);
      }
      
      // Ordenar por fecha (más reciente primero)
      allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Mostrar actividades después de filtrar
      console.log('=== ACTIVIDADES DESPUÉS DE FILTRAR ===');
      console.log('Total de actividades mostradas:', allActivities.length);
      allActivities.forEach(activity => {
        console.log(`- ${activity.id}: ${activity.type} - ${activity.customerName} - ${activity.product?.name || 'Sin producto'}`);
      });
      
      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Estado para clientes
  const [customers, setCustomers] = useState<any[]>([]);

  // Cargar clientes
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const loadedCustomers = await customerStorage.getAll();
        setCustomers(loadedCustomers);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };
    loadCustomers();
  }, []);

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'refund':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Actividades de Clientes</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Compras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="customer" className="block text-base font-medium text-gray-700">
              Filtrar por Cliente
            </label>
            <select
              id="customer"
              className="w-full px-4 py-2.5 text-base rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="all">Todos los clientes</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-base font-medium text-gray-700">
              Operación
            </label>
            <div className="px-4 py-2.5 text-base rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500">
              Compras
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Actualmente solo disponible: registro de compras
            </p>
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {activities.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No hay actividades para mostrar con los filtros seleccionados.
            </li>
          ) : (
            activities.map((activity) => (
              <li key={activity.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.customerName}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                        {activity.type === 'purchase' ? 'Compra' : activity.type === 'refund' ? 'Reembolso' : 'Otra actividad'}
                      </span>
                      <span className="ml-2 text-sm text-gray-900 font-medium">
                        {activity.product ? activity.product.name : 'Producto no disponible'}
                      </span>
                      {activity.product && (
                        <>
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            ${activity.product.price.toFixed(2)}
                          </span>
                          {/* Mostrar categoría del producto al lado del precio */}
                          {activity.product.categoryId && (
                            <span
                              className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                              style={{
                                backgroundColor: `${categories.find(c => c.id === activity.product.categoryId)?.color || '#e5e7eb'}33`,
                                color: categories.find(c => c.id === activity.product.categoryId)?.color || '#6b7280',
                                border: `1px solid ${categories.find(c => c.id === activity.product.categoryId)?.color || '#e5e7eb'}`,
                              }}
                            >
                              {categories.find(c => c.id === activity.product.categoryId)?.name}
                            </span>
                          )}
                          {!activity.product.categoryId && (
                            <span className="ml-2 text-xs text-gray-500">Sin categoría</span>
                          )}
                        </>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="mt-1 text-sm text-gray-500">
                        {activity.notes}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <p className="text-sm text-gray-500">
                      {formatActivityDate(activity.date)}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
