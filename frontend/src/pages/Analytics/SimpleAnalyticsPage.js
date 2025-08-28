import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import SimpleStockChart from '../../components/charts/SimpleStockChart';
import SimpleMovementsChart from '../../components/charts/SimpleMovementsChart';
import { LowStockAlertsChart, SimpleCountriesChart } from '../../components/charts';
import reportService from '../../services/reportService';

const SimpleAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stockByCategory: [],
    movementsTimeline: [],
    countriesSummary: [],
    lowStockAlerts: null,
    lastUpdated: null
  });

  const [filters, setFilters] = useState({
    dateRange: 'last_month',
    groupBy: 'day',
    categoryId: null
  });

  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener rango de fechas según filtro
      let dateRange = {};
      switch (filters.dateRange) {
        case 'last_week':
          dateRange = reportService.getLastWeekRange();
          break;
        case 'this_month':
          dateRange = reportService.getThisMonthRange();
          break;
        default:
          dateRange = reportService.getLastMonthRange();
      }

      // Cargar datos
      const [
        stockByCategoryRes,
        movementsTimelineRes,
        countriesSummaryRes,
        lowStockAlertsRes
      ] = await Promise.all([
        reportService.getStockByCategory(filters.categoryId),
        reportService.getMovementsTimeline(
          dateRange.fechaDesde,
          dateRange.fechaHasta,
          filters.groupBy
        ),
        reportService.getCountriesSummary(),
        reportService.getLowStockAlerts(10)
      ]);

      setData({
        stockByCategory: stockByCategoryRes.data || [],
        movementsTimeline: movementsTimelineRes.data || [],
        countriesSummary: countriesSummaryRes.data || [],
        lowStockAlerts: lowStockAlertsRes,
        lastUpdated: new Date()
      });

    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Error al cargar los datos de reportes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [filters.dateRange, filters.groupBy, filters.categoryId]);

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-900">Cargando reportes...</div>
          <div className="text-sm text-gray-500">Obteniendo datos de la base de datos</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <div className="text-gray-700 mb-4">{error}</div>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-500">
                Reportes y métricas del inventario
                {data.lastUpdated && (
                  <span className="ml-2">
                    • Actualizado: {data.lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="last_week">Última semana</option>
                <option value="last_month">Último mes</option>
                <option value="this_month">Este mes</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filters.groupBy}
                onChange={(e) => handleFilterChange({ groupBy: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="day">Por día</option>
                <option value="week">Por semana</option>
                <option value="month">Por mes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock por Categoría */}
          <div className="lg:col-span-1">
            <SimpleStockChart 
              data={data.stockByCategory} 
              loading={refreshing}
            />
          </div>

          {/* Alertas de Stock Bajo */}
          <div className="lg:col-span-1">
            <LowStockAlertsChart 
              data={data.lowStockAlerts} 
              loading={refreshing}
            />
          </div>

          {/* Timeline de Movimientos */}
          <div className="lg:col-span-2">
            <SimpleMovementsChart 
              data={data.movementsTimeline}
              groupBy={filters.groupBy}
              loading={refreshing}
            />
          </div>

          {/* Países */}
          <div className="lg:col-span-2">
            <SimpleCountriesChart 
              data={data.countriesSummary} 
              loading={refreshing}
            />
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Total Categorías</div>
            <div className="text-2xl font-bold text-gray-900">
              {data.stockByCategory.length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Stock Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {data.stockByCategory.reduce((sum, cat) => sum + cat.total_stock, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Países Activos</div>
            <div className="text-2xl font-bold text-gray-900">
              {data.countriesSummary.length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm font-medium text-gray-500">Alertas Críticas</div>
            <div className="text-2xl font-bold text-red-600">
              {data.lowStockAlerts?.critical_count || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAnalyticsPage;