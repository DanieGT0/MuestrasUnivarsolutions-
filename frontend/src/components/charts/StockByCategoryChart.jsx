import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const StockByCategoryChart = ({ data, title = "Stock por Categoría" }) => {
  const { isDarkMode } = useTheme();
  // Colores para las categorías
  const colors = ['#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED', '#BE185D'];

  // Calcular el total de stock
  const totalStock = data?.reduce((sum, item) => sum + item.total_stock, 0) || 0;

  // Función para crear el path del gráfico donut
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

  if (!data || data.length === 0) {
    return (
      <div className={`rounded-lg shadow-lg p-6 w-full ${
        isDarkMode ? 'glass-card' : 'bg-white'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </h3>
        <div className="flex items-center justify-center h-48">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay datos disponibles
          </p>
        </div>
      </div>
    );
  }

  let currentAngle = -90; // Empezar desde arriba

  return (
    <div className={`rounded-lg shadow-lg p-6 w-full ${
      isDarkMode ? 'glass-card' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        {title}
      </h3>
      
      {/* Gráfico Donut */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {data.map((item, index) => {
              const color = colors[index % colors.length];
              const path = createDonutPath(item.percentage, currentAngle);
              const angle = currentAngle;
              currentAngle += (item.percentage / 100) * 360;
              
              return (
                <path
                  key={index}
                  d={path}
                  fill={color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
          
          {/* Texto central */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {totalStock.toLocaleString()}
            </span>
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Stock
            </span>
          </div>
        </div>
      </div>
      
      {/* Lista de categorías */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.category_id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <div>
                <span className="text-sm font-medium text-gray-800">
                  {item.category_name}
                </span>
                <div className="text-xs text-gray-500">
                  {item.total_products} productos
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">
                {item.total_stock.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Resumen en la parte inferior */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-800">
              {data.reduce((sum, item) => sum + item.total_products, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Productos</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {data.length}
            </div>
            <div className="text-xs text-gray-500">Categorías</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockByCategoryChart;