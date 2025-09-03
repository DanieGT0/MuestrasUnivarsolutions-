import React, { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import StockByCategoryChart from '../../components/charts/StockByCategoryChart';
import MovementsTimelineChart from '../../components/charts/MovementsTimelineChart';
import MovementsSummaryCard from '../../components/charts/MovementsSummaryCard';
import InventoryRotationChart from '../../components/charts/InventoryRotationChart';
import ProductRotationTable from '../../components/charts/ProductRotationTable';
import ProductsByCountryChart from '../../components/charts/ProductsByCountryChart';
import StockByCountryChart from '../../components/charts/StockByCountryChart';
import reportService from '../../services/reportService';

const CommercialDashboard = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [movementsSummary, setMovementsSummary] = useState(null);
  const [movementsTimeline, setMovementsTimeline] = useState(null);
  const [countriesData, setCountriesData] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [rotationData, setRotationData] = useState(null);
  const [error, setError] = useState(null);
  
  // Filtros
  const [dateRange, setDateRange] = useState('last_month');
  const [groupBy, setGroupBy] = useState('day');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Opciones de rangos de fecha
  const dateRangeOptions = {
    last_week: { label: 'Última Semana', days: 7 },
    last_month: { label: 'Último Mes', days: 30 },
    this_month: { label: 'Este Mes', days: null }
  };

  // Cargar datos iniciales
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener rango de fechas
      let fechaDesde, fechaHasta;
      const now = new Date();
      
      if (dateRange === 'last_week') {
        fechaDesde = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        fechaHasta = now;
      } else if (dateRange === 'last_month') {
        fechaDesde = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        fechaHasta = now;
      } else if (dateRange === 'this_month') {
        fechaDesde = new Date(now.getFullYear(), now.getMonth(), 1);
        fechaHasta = now;
      }
      
      // Formatear fechas para API
      const fechaDesdeStr = fechaDesde ? fechaDesde.toISOString() : null;
      const fechaHastaStr = fechaHasta ? fechaHasta.toISOString() : null;
      
      // Cargar datos principales primero
      const [
        stockResponse,
        summaryResponse,
        timelineResponse,
        countriesResponse,
        alertsResponse
      ] = await Promise.all([
        reportService.getStockByCategory(selectedCategory),
        reportService.getMovementsSummary(fechaDesdeStr, fechaHastaStr, selectedCategory),
        reportService.getMovementsTimeline(fechaDesdeStr, fechaHastaStr, groupBy),
        reportService.getCountriesSummary(),
        reportService.getLowStockAlerts(10)
      ]);
      
      // Cargar métricas de rotación por separado para manejar errores
      let rotationResponse = null;
      try {
        rotationResponse = await reportService.getInventoryRotationMetrics(selectedCategory, 90);
      } catch (rotationError) {
        console.warn('Rotation metrics not available yet:', rotationError.message);
        rotationResponse = null;
      }
      
      setStockData(stockResponse);
      setMovementsSummary(summaryResponse);
      setMovementsTimeline(timelineResponse);
      setCountriesData(countriesResponse);
      setAlerts(alertsResponse);
      setRotationData(rotationResponse);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      console.error('Error details:', err.response?.data);
      setError(`Error al cargar los datos del dashboard: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadDashboardData();
  }, [dateRange, groupBy, selectedCategory]);

  // Función para refrescar datos
  const handleRefresh = () => {
    loadDashboardData();
  };

  // Función para exportar datos (placeholder)
  const handleExport = () => {
    alert('Función de exportación en desarrollo');
  };

  if (error) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`border rounded-lg p-4 ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-600/30' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className={`${
                isDarkMode ? 'text-red-300' : 'text-red-700'
              }`}>
                {error}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Dashboard Comercial
              </h1>
              <p className={`mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Análisis de stock y movimientos por categoría y país
              </p>
            </div>
            
            {/* Controles */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
              {/* Selector de rango de fechas */}
              <div className="flex items-center space-x-2">
                <Calendar className={`h-4 w-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className={`theme-input border rounded-lg px-3 py-2 text-sm ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {Object.entries(dateRangeOptions).map(([key, option]) => (
                    <option key={key} value={key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Selector de agrupación temporal */}
              <div className="flex items-center space-x-2">
                <Filter className={`h-4 w-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className={`theme-input border rounded-lg px-3 py-2 text-sm ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  <option value="day">Por Día</option>
                  <option value="week">Por Semana</option>
                  <option value="month">Por Mes</option>
                </select>
              </div>
              
              {/* Botones de acción */}
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className={`btn-theme-primary flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
                
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors text-white ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDarkMode 
                      ? 'bg-green-600 hover:bg-green-500' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de stock bajo */}
        {alerts && alerts.total_alerts > 0 && (
          <div className="mb-6">
            <div className={`border rounded-lg p-4 ${
              isDarkMode 
                ? 'bg-yellow-900/20 border-yellow-600/30' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className={`font-medium ${
                  isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                }`}>
                  Tienes {alerts.total_alerts} productos con stock bajo
                </span>
                {alerts.critical_count > 0 && (
                  <span className={`px-2 py-1 rounded text-xs ${
                    isDarkMode 
                      ? 'bg-red-900/30 text-red-300' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {alerts.critical_count} críticos
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grid principal de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stock por Categoría */}
          <div>
            {loading ? (
              <div className={`rounded-lg shadow-lg p-6 h-96 flex items-center justify-center ${
                isDarkMode ? 'glass-card' : 'bg-white'
              }`}>
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                  isDarkMode ? 'border-blue-400' : 'border-blue-600'
                }`}></div>
              </div>
            ) : (
              <StockByCategoryChart 
                data={stockData?.data || []} 
                title="Stock por Categoría"
              />
            )}
          </div>
          
          {/* Gráficas por País - Productos y Stock */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Productos por País */}
            <div className="flex justify-center">
              {loading ? (
                <div className={`rounded-lg shadow-lg p-6 h-96 w-80 flex items-center justify-center ${
                  isDarkMode ? 'glass-card' : 'bg-white'
                }`}>
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                    isDarkMode ? 'border-blue-400' : 'border-blue-600'
                  }`}></div>
                </div>
              ) : (
                <ProductsByCountryChart />
              )}
            </div>
            
            {/* Stock por País */}
            <div className="flex justify-center">
              {loading ? (
                <div className={`rounded-lg shadow-lg p-6 h-96 w-80 flex items-center justify-center ${
                  isDarkMode ? 'glass-card' : 'bg-white'
                }`}>
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                    isDarkMode ? 'border-blue-400' : 'border-blue-600'
                  }`}></div>
                </div>
              ) : (
                <StockByCountryChart />
              )}
            </div>
          </div>
          
          {/* Resumen de Movimientos */}
          <div>
            {loading ? (
              <div className={`rounded-lg shadow-lg p-6 h-96 flex items-center justify-center ${
                isDarkMode ? 'glass-card' : 'bg-white'
              }`}>
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                  isDarkMode ? 'border-blue-400' : 'border-blue-600'
                }`}></div>
              </div>
            ) : (
              <MovementsSummaryCard 
                data={movementsSummary} 
                title="Resumen de Movimientos"
              />
            )}
          </div>
        </div>

        {/* Timeline de movimientos - ancho completo */}
        <div className="mb-6">
          {loading ? (
            <div className={`rounded-lg shadow-lg p-6 h-64 flex items-center justify-center ${
              isDarkMode ? 'glass-card' : 'bg-white'
            }`}>
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
            </div>
          ) : (
            <MovementsTimelineChart 
              data={movementsTimeline?.data || []} 
              title={`Timeline de Movimientos (${dateRangeOptions[dateRange].label})`}
            />
          )}
        </div>

        {/* Métricas de Rotación de Inventario */}
        <div className="mb-6">
          {loading ? (
            <div className={`rounded-lg shadow-lg p-6 h-96 flex items-center justify-center ${
              isDarkMode ? 'glass-card' : 'bg-white'
            }`}>
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
            </div>
          ) : (
            <InventoryRotationChart 
              data={rotationData} 
              title="Análisis de Rotación de Inventario"
            />
          )}
        </div>

        {/* Tabla detallada de rotación por producto */}
        <div className="mb-6">
          {loading ? (
            <div className={`rounded-lg shadow-lg p-6 h-96 flex items-center justify-center ${
              isDarkMode ? 'glass-card' : 'bg-white'
            }`}>
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkMode ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
            </div>
          ) : (
            <ProductRotationTable 
              data={rotationData} 
              title="Rotación Detallada por Producto"
            />
          )}
        </div>

        {/* Resumen por países */}
        {countriesData && countriesData.data && countriesData.data.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock por País</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countriesData.data.map((country) => (
                <div key={country.country_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-lg font-semibold text-gray-800">
                    {country.country_name}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {country.total_stock.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {country.total_products} productos ({country.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer con timestamp */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString('es-ES')}
        </div>
      </div>
    </div>
  );
};

export default CommercialDashboard;