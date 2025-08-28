import React, { useState } from 'react';
import { Clock, TrendingUp, Package, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import * as XLSX from 'xlsx';

const InventoryRotationChart = ({ data, title = "Métricas de Rotación de Inventario" }) => {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState('products'); // 'products' | 'units'
  const [isExporting, setIsExporting] = useState(false);
  console.log('InventoryRotationChart data:', data);
  
  if (!data || !data.global_stats) {
    return (
      <div className={`rounded-lg shadow-lg p-6 w-full ${
        isDarkMode ? 'glass-card' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>{title}</h3>
        <div className="flex items-center justify-center h-48">
          <p className={`${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>No hay datos de rotación disponibles</p>
        </div>
      </div>
    );
  }

  const { global_stats, age_distribution, category_averages } = data;

  // Colores para distribución por edad
  const ageColors = {
    '0-30': 'bg-green-500',
    '31-60': 'bg-yellow-500', 
    '61-90': 'bg-orange-500',
    '90+': 'bg-red-500'
  };

  const ageLabels = {
    '0-30': '0-30 días (Nuevo)',
    '31-60': '31-60 días (Medio)',
    '61-90': '61-90 días (Viejo)', 
    '90+': '+90 días (Muy Viejo)'
  };

  // Calcular totales para porcentajes - compatible con formato viejo y nuevo
  const totalAgeProducts = Object.values(age_distribution).reduce((sum, val) => {
    if (typeof val === 'object' && val !== null) {
      return sum + (val.products || 0);
    }
    return sum + (val || 0);
  }, 0);
  
  const totalAgeUnits = Object.values(age_distribution).reduce((sum, val) => {
    if (typeof val === 'object' && val !== null) {
      return sum + (val.units || 0);
    }
    return sum + (val || 0);
  }, 0);

  // Función para exportar a Excel
  const handleExportExcel = async () => {
    if (!data || isExporting) return;

    try {
      setIsExporting(true);

      // Crear libro de Excel
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Resumen General
      const summaryData = [
        ['REPORTE DE ROTACIÓN DE INVENTARIOS'],
        ['Generado el:', new Date().toLocaleString('es-ES')],
        ['Período de análisis:', `${data.analysis_period_days} días`],
        [''],
        ['MÉTRICAS GLOBALES'],
        ['Total de productos:', data.global_stats.total_products || 0],
        ['Productos rápidos:', data.global_stats.fast_moving_products || 0],
        ['Productos lentos:', data.global_stats.slow_moving_products || 0],
        ['% Productos rápidos:', `${data.global_stats.fast_moving_percentage || 0}%`],
        ['Días promedio permanencia:', data.global_stats.avg_days_permanence || 0],
        ['Velocidad promedio (unid/día):', data.global_stats.avg_velocity_per_day || 0],
        [''],
        ['DISTRIBUCIÓN POR EDAD DEL STOCK'],
        ['Rango', 'Productos', 'Unidades', '% Productos', '% Unidades']
      ];

      Object.entries(age_distribution).forEach(([range, values]) => {
        let products = 0;
        let units = 0;
        
        if (typeof values === 'object' && values !== null) {
          products = values.products || 0;
          units = values.units || 0;
        } else {
          products = values || 0;
          units = values || 0;
        }
        
        const prodPercentage = totalAgeProducts > 0 ? ((products / totalAgeProducts) * 100).toFixed(1) : 0;
        const unitsPercentage = totalAgeUnits > 0 ? ((units / totalAgeUnits) * 100).toFixed(1) : 0;
        
        summaryData.push([
          range === '0-30' ? '0-30 días (Nuevo)' :
          range === '31-60' ? '31-60 días (Medio)' :
          range === '61-90' ? '61-90 días (Viejo)' : '+90 días (Muy Viejo)',
          products,
          units,
          `${prodPercentage}%`,
          `${unitsPercentage}%`
        ]);
      });

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Hoja 2: Detalle por Productos (si hay datos disponibles)
      if (data.products && data.products.length > 0) {
        const productsData = [
          ['DETALLE POR PRODUCTOS'],
          [''],
          ['Código', 'Nombre', 'Categoría', 'Stock Actual', 'Días en Stock', 
           'Velocidad/día', 'Tasa Rotación %', 'Clasificación', 'Rango Edad']
        ];

        data.products.forEach(product => {
          productsData.push([
            product.product_code || '',
            product.product_name || '',
            product.category_name || '',
            product.current_stock || 0,
            product.days_since_entry || 0,
            product.velocity_per_day || 0,
            product.rotation_rate || 0,
            product.is_fast_moving ? 'Rápido' : 'Lento',
            product.stock_age_category || ''
          ]);
        });

        const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Detalle Productos');
      }

      // Hoja 3: Estadísticas por Categoría (si hay datos disponibles)
      if (data.category_averages && data.category_averages.length > 0) {
        const categoryData = [
          ['ESTADÍSTICAS POR CATEGORÍA'],
          [''],
          ['Categoría', 'Total Productos', 'Días Prom. Permanencia', 'Velocidad Prom./día', 
           'Productos Rápidos', 'Productos Lentos', '% Rápidos']
        ];

        data.category_averages.forEach(category => {
          categoryData.push([
            category.category_name || '',
            category.total_products || 0,
            category.avg_days_permanence || 0,
            category.avg_velocity_per_day || 0,
            category.fast_moving_count || 0,
            category.slow_moving_count || 0,
            `${category.fast_moving_percentage || 0}%`
          ]);
        });

        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Por Categoría');
      }

      // Generar nombre de archivo
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const fileName = `Rotacion_Inventarios_${timestamp}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, fileName);

      console.log(`Archivo Excel exportado: ${fileName}`);

    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, intente de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`rounded-lg shadow-lg p-6 w-full ${
      isDarkMode ? 'glass-card' : 'bg-white'
    }`}>
      {/* Header con título y botón de exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>{title}</h3>
        
        {/* Botón de exportar */}
        {data && data.global_stats && (
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className={`mt-3 sm:mt-0 flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isExporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Download className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
            <span>{isExporting ? 'Exportando...' : 'Exportar Excel'}</span>
          </button>
        )}
      </div>
      
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Promedio días permanencia */}
        <div className={`rounded-lg p-4 ${
          isDarkMode
            ? 'bg-blue-900/20 border border-blue-600/30'
            : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Días Promedio en Stock</p>
              <p className="text-2xl font-bold text-blue-700">
                {global_stats.avg_days_permanence}
              </p>
              <p className="text-xs text-blue-500">días</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        {/* Velocidad promedio */}
        <div className={`rounded-lg p-4 ${
          isDarkMode
            ? 'bg-blue-900/20 border border-blue-600/30'
            : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Velocidad de Salida</p>
              <p className="text-2xl font-bold text-blue-700">
                {global_stats.avg_velocity_per_day}
              </p>
              <p className="text-xs text-blue-500">unidades/día</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        {/* Productos movimiento rápido */}
        <div className={`rounded-lg p-4 ${
          isDarkMode
            ? 'bg-blue-900/20 border border-blue-600/30'
            : 'bg-blue-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Movimiento Rápido</p>
              <p className="text-2xl font-bold text-blue-700">
                {global_stats.fast_moving_percentage}%
              </p>
              <p className="text-xs text-blue-500">
                {global_stats.fast_moving_products} de {global_stats.total_products}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Distribución por edad del stock */}
      <div className="mb-6">
        <h4 className={`text-md font-semibold mb-4 ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          Distribución de Stock por Edad
        </h4>
        
        {/* Toggle entre productos y unidades */}
        <div className="flex justify-center mb-4">
          <div className={`flex rounded-lg p-1 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setViewMode('products')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'products'
                  ? isDarkMode
                    ? 'bg-gray-600 text-blue-400 shadow-sm'
                    : 'bg-white text-blue-600 shadow-sm'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📦 Por Productos ({Number(totalAgeProducts) || 0})
            </button>
            <button
              onClick={() => setViewMode('units')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'units'
                  ? isDarkMode
                    ? 'bg-gray-600 text-blue-400 shadow-sm'
                    : 'bg-white text-blue-600 shadow-sm'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Por Unidades ({Number(totalAgeUnits) || 0})
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {Object.entries(age_distribution).map(([ageRange, data]) => {
            // Manejo seguro de datos - compatible con formato viejo y nuevo
            let products = 0;
            let units = 0;
            
            if (typeof data === 'object' && data !== null) {
              products = data.products || 0;
              units = data.units || 0;
            } else {
              // Formato viejo - solo números
              products = data || 0;
              units = data || 0;
            }
            
            const isProductView = viewMode !== 'units';
            const currentValue = isProductView ? products : units;
            const totalValue = isProductView ? totalAgeProducts : totalAgeUnits;
            const percentage = totalValue > 0 ? (currentValue / totalValue * 100) : 0;
            
            return (
              <div key={ageRange} className="flex items-center space-x-3">
                <span className={`text-sm w-32 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {ageLabels[ageRange]}
                </span>
                <div className={`flex-1 rounded-full h-4 relative ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`${ageColors[ageRange]} h-4 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className={`text-sm w-24 text-right ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <div className="font-semibold">
                    {Number(currentValue) || 0} ({percentage.toFixed(1)}%)
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {isProductView ? `${Number(units) || 0} unids` : `${Number(products) || 0} prods`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas por categoría */}
      {category_averages && category_averages.length > 0 && (
        <div>
          <h4 className={`text-md font-semibold mb-4 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Promedio por Categoría
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <tr>
                  <th className={`px-3 py-2 text-left text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Categoría
                  </th>
                  <th className={`px-3 py-2 text-center text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Productos
                  </th>
                  <th className={`px-3 py-2 text-center text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Días Prom.
                  </th>
                  <th className={`px-3 py-2 text-center text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Velocidad
                  </th>
                  <th className={`px-3 py-2 text-center text-xs font-medium uppercase ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    % Rápidos
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDarkMode ? 'divide-gray-600' : 'divide-gray-200'
              }`}>
                {category_averages.map((category, index) => (
                  <tr key={index} className={`${
                    isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}>
                    <td className={`px-3 py-2 font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {category.category_name}
                    </td>
                    <td className={`px-3 py-2 text-center ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {category.total_products}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-medium ${
                        category.avg_days_permanence <= 30 ? 'text-green-600' :
                        category.avg_days_permanence <= 60 ? 'text-yellow-600' :
                        category.avg_days_permanence <= 90 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {category.avg_days_permanence}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-center ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {category.avg_velocity_per_day}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-medium ${
                        category.fast_moving_percentage >= 50 ? 'text-green-600' :
                        category.fast_moving_percentage >= 25 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {category.fast_moving_percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer con información del período */}
      <div className={`mt-6 pt-4 border-t ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className={`text-xs text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Análisis de últimos {data.analysis_period_days} días • 
          Generado: {new Date(data.generated_at).toLocaleDateString('es-GT')}
        </div>
      </div>
    </div>
  );
};

export default InventoryRotationChart;