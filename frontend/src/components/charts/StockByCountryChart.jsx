import React, { useState, useEffect } from 'react';
import reportService from '../../services/reportService';

const StockByCountryChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStock, setTotalStock] = useState(0);

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
    loadStockByCountry();
  }, []);

  const loadStockByCountry = async () => {
    try {
      setLoading(true);
      
      // Obtener resumen de países que incluye total_stock
      const countriesResponse = await reportService.getCountriesSummary();
      
      console.log('Countries stock response:', countriesResponse);

      // Validar que tenemos datos de países
      if (!countriesResponse || !countriesResponse.data || !Array.isArray(countriesResponse.data)) {
        console.error('Countries stock data is not valid:', countriesResponse);
        throw new Error('La respuesta de stock por países no es válida');
      }

      const countriesData = countriesResponse.data;
      let total = 0;

      // Calcular total de stock
      countriesData.forEach(country => {
        total += country.total_stock || 0;
      });

      console.log('Countries stock data:', countriesData);
      console.log('Total stock:', total);

      // Convertir a formato del gráfico
      const chartData = countriesData
        .filter(country => (country.total_stock || 0) > 0) // Solo países con stock
        .map((country, index) => {
          const config = countryConfig[country.country_name];
          const stockAmount = country.total_stock || 0;
          
          return {
            country: country.country_name,
            stock: stockAmount,
            percentage: total > 0 ? Math.round((stockAmount / total) * 100) : 0,
            color: config?.color || defaultColors[index % defaultColors.length],
            flag: config?.flag || (
              <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200 bg-gray-300"></div>
            ),
            products: country.total_products || 0
          };
        })
        .sort((a, b) => b.stock - a.stock); // Ordenar por stock descendente

      setData(chartData);
      setTotalStock(total);
    } catch (error) {
      console.error('Error loading stock by country:', error);
      console.error('Error details:', error.message);
      
      // Establecer datos de ejemplo en caso de error
      setData([
        {
          country: 'Error al cargar datos',
          stock: 0,
          percentage: 100,
          color: '#EF4444',
          flag: <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-200 bg-red-200"></div>,
          products: 0
        }
      ]);
      setTotalStock(0);
    } finally {
      setLoading(false);
    }
  };

  // Calculate SVG path for donut chart
  const createDonutPath = (percentage, startAngle = 0) => {
    if (percentage <= 0) return '';
    
    const radius = 80;
    const innerRadius = 60;
    const centerX = 100;
    const centerY = 100;
    
    const angle = Math.min((percentage / 100) * 360, 359.99); // Evitar problemas con 360°
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
    
    if (angle >= 359.99) {
      // Círculo completo, dibujarlo como dos semicírculos
      return `M ${x1} ${y1} A ${radius} ${radius} 0 1 1 ${centerX + radius * Math.cos((startAngle + 180) * Math.PI / 180)} ${centerY + radius * Math.sin((startAngle + 180) * Math.PI / 180)} A ${radius} ${radius} 0 1 1 ${x1} ${y1} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 1 0 ${centerX + innerRadius * Math.cos((startAngle + 180) * Math.PI / 180)} ${centerY + innerRadius * Math.sin((startAngle + 180) * Math.PI / 180)} A ${innerRadius} ${innerRadius} 0 1 0 ${x4} ${y4} Z`;
    }
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  // Formatear números para mostrar
  const formatStock = (stock) => {
    if (stock >= 1000000) {
      return `${(stock / 1000000).toFixed(1)}M`;
    } else if (stock >= 1000) {
      return `${(stock / 1000).toFixed(1)}K`;
    }
    return stock.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Stock por País</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  let currentAngle = -90; // Start from top

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Stock por País</h3>
      
      {data.length > 0 && data[0].country !== 'Error al cargar datos' ? (
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
                      title={`${item.country}: ${item.stock.toLocaleString()} unidades (${item.percentage}%)`}
                    />
                  );
                })}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-gray-800">
                  {formatStock(totalStock)}
                </div>
                <div className="text-sm text-gray-500">Unidades</div>
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
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">
                      {formatStock(item.stock)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional Stats */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Total Stock</span>
              <span className="font-semibold">{totalStock.toLocaleString()} unidades</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
              <span>Países con Stock</span>
              <span className="font-semibold">{data.length}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-4xl mb-4">📦</div>
          <div className="text-center">
            <div className="font-medium">No hay stock disponible</div>
            <div className="text-sm">No se encontró inventario para mostrar</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockByCountryChart;