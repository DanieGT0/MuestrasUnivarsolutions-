import React from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

const SimpleStockChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-gray-500">No hay datos disponibles</div>
      </div>
    );
  }

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
  ];

  const maxStock = Math.max(...data.map(item => item.total_stock));
  const totalStock = data.reduce((sum, item) => sum + item.total_stock, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-blue-600" />
          Stock por Categoría
        </h3>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>

      {/* Gráfico de barras simple */}
      <div className="space-y-4 mb-6">
        {data.map((item, index) => {
          const percentage = (item.total_stock / maxStock) * 100;
          const colorClass = colors[index % colors.length];
          
          return (
            <div key={item.category_id} className="relative">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{item.category_name}</span>
                <span className="text-gray-600">{item.total_stock.toLocaleString()} unidades</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${colorClass} transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>{item.total_products} productos</span>
                <span>{item.percentage}% del total</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-gray-600">Categorías</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalStock.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Stock Total</div>
        </div>
      </div>

      {/* Lista detallada */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Detalle por Categoría</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {data.map((category, index) => (
            <div key={category.category_id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                <span className="text-sm font-medium">{category.category_name}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{category.total_stock.toLocaleString()}</span>
                <span>{category.total_products} productos</span>
                <span className="text-blue-600 font-medium">{category.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleStockChart;