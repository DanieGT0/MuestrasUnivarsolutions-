import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';

const ProductsByCountryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Configuración de colores y banderas por país
  const countryConfig = {
    'El Salvador': {
      color: '#4F46E5',
      flag: (
        <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200">
          <div className="h-1/3 bg-blue-600"></div>
          <div className="h-1/3 bg-white"></div>
          <div className="h-1/3 bg-blue-600"></div>
        </div>
      )
    },
    'Costa Rica': {
      color: '#7C3AED',
      flag: (
        <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200">
          <div className="h-1/5 bg-blue-600"></div>
          <div className="h-1/5 bg-white"></div>
          <div className="h-1/5 bg-red-600"></div>
          <div className="h-1/5 bg-white"></div>
          <div className="h-1/5 bg-blue-600"></div>
        </div>
      )
    },
    'Guatemala': {
      color: '#059669',
      flag: (
        <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200">
          <div className="flex h-full">
            <div className="w-1/3 bg-blue-500"></div>
            <div className="w-1/3 bg-white"></div>
            <div className="w-1/3 bg-blue-500"></div>
          </div>
        </div>
      )
    },
    'Panamá': {
      color: '#DC2626',
      flag: (
        <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200">
          <div className="h-1/2 flex">
            <div className="w-1/2 bg-white"></div>
            <div className="w-1/2 bg-red-600"></div>
          </div>
          <div className="h-1/2 flex">
            <div className="w-1/2 bg-blue-600"></div>
            <div className="w-1/2 bg-white"></div>
          </div>
        </div>
      )
    },
    'Honduras': {
      color: '#F59E0B',
      flag: (
        <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200">
          <div className="h-1/3 bg-blue-600"></div>
          <div className="h-1/3 bg-white"></div>
          <div className="h-1/3 bg-blue-600"></div>
        </div>
      )
    },
    'República Dominicana': {
      color: '#6B7280',
      flag: (
        <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200 relative">
          <div className="h-1/2 flex">
            <div className="w-1/2 bg-blue-600"></div>
            <div className="w-1/2 bg-red-600"></div>
          </div>
          <div className="h-1/2 flex">
            <div className="w-1/2 bg-red-600"></div>
            <div className="w-1/2 bg-blue-600"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-full bg-white"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-white"></div>
          </div>
        </div>
      )
    }
  };

  // Colores por defecto para países no configurados
  const defaultColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F97316', '#EF4444', '#84CC16'];

  useEffect(() => {
    loadProductsByCountry();
  }, []);

  const loadProductsByCountry = async () => {
    try {
      setLoading(true);
      
      // Usar reportService para obtener resumen por países que ya funciona
      const reportService = await import('../../services/reportService');
      
      // Obtener resumen de países que ya funciona en el dashboard
      const countriesResponse = await reportService.default.getCountriesSummary();
      
      console.log('Countries response:', countriesResponse);

      // Validar que tenemos datos de países
      if (!countriesResponse || !countriesResponse.data || !Array.isArray(countriesResponse.data)) {
        console.error('Countries data is not valid:', countriesResponse);
        throw new Error('La respuesta de países no es válida');
      }

      const countriesData = countriesResponse.data;
      let total = 0;

      // Calcular total de productos
      countriesData.forEach(country => {
        total += country.total_products;
      });

      console.log('Countries data:', countriesData);
      console.log('Total products:', total);

      // Convertir a formato del gráfico
      const chartData = countriesData.map((country, index) => {
        const config = countryConfig[country.country_name];
        return {
          country: country.country_name,
          count: country.total_products,
          percentage: total > 0 ? Math.round((country.total_products / total) * 100) : 0,
          color: config?.color || defaultColors[index % defaultColors.length],
          flag: config?.flag || (
            <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200 bg-gray-300"></div>
          )
        };
      }).sort((a, b) => b.count - a.count); // Ordenar por cantidad descendente

      setData(chartData);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error loading products by country:', error);
      console.error('Error details:', error.message);
      
      // Establecer datos de ejemplo en caso de error
      setData([
        {
          country: 'Error al cargar datos',
          count: 0,
          percentage: 100,
          color: '#EF4444',
          flag: <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200 bg-red-200"></div>
        }
      ]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate SVG path for donut chart
  const createDonutPath = (percentage, startAngle = 0) => {
    const radius = 80;
    const innerRadius = 60;
    const centerX = 100;
    const centerY = 100;
    
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Productos por País</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  let currentAngle = -90; // Start from top

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Productos por País</h3>
      
      {data.length > 0 ? (
        <>
          {/* Donut Chart */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {data.map((item, index) => {
                  const path = createDonutPath(item.percentage, currentAngle);
                  const angle = currentAngle;
                  currentAngle += (item.percentage / 100) * 360;
                  
                  return (
                    <path
                      key={index}
                      d={path}
                      fill={item.color}
                      className="transition-all duration-300 hover:opacity-80"
                      title={`${item.country}: ${item.count} productos (${item.percentage}%)`}
                    />
                  );
                })}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-800">
                  {totalProducts > 999 ? `${(totalProducts / 1000).toFixed(1)}K` : totalProducts}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Country Statistics */}
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {item.flag}
                  <span className="text-sm font-medium text-gray-700">{item.country}</span>
                </div>
                <div className="flex items-center space-x-3 flex-1 ml-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional Stats */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Total de Productos</span>
              <span className="font-semibold">{totalProducts.toLocaleString()}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-center">
            <div className="font-medium">No hay datos disponibles</div>
            <div className="text-sm">No se encontraron productos para mostrar</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsByCountryChart;