import React from 'react';
import { Globe, MapPin } from 'lucide-react';

const SimpleCountriesChart = ({ data, loading = false }) => {
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

  const sortedData = [...data].sort((a, b) => b.total_stock - a.total_stock);
  const maxStock = Math.max(...sortedData.map(item => item.total_stock));
  const maxProducts = Math.max(...sortedData.map(item => item.total_products));

  const totalCountries = sortedData.length;
  const totalStock = sortedData.reduce((sum, item) => sum + item.total_stock, 0);
  const totalProducts = sortedData.reduce((sum, item) => sum + item.total_products, 0);

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
    'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Globe className="h-5 w-5 mr-2 text-blue-600" />
          Inventario por País
        </h3>
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>

      {/* Gráfico de barras doble */}
      <div className="mb-6">
        <div className="space-y-4">
          {sortedData.map((country, index) => {
            const stockPercentage = (country.total_stock / maxStock) * 100;
            const productsPercentage = (country.total_products / maxProducts) * 100;
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={country.country_id} className="space-y-2">
                {/* Nombre del país */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                    <span className="font-medium text-gray-700">{country.country_name}</span>
                  </div>
                  <span className="text-gray-600">{country.percentage}% del total</span>
                </div>
                
                {/* Barra de stock */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Stock: {country.total_stock.toLocaleString()} unidades</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${colorClass} transition-all duration-500`}
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Barra de productos */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Productos: {country.total_products}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colorClass} opacity-60 transition-all duration-500`}
                      style={{ width: `${productsPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCountries}</div>
          <div className="text-sm text-gray-600">Países</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">{totalStock.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Stock Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalProducts}</div>
          <div className="text-sm text-gray-600">Productos</div>
        </div>
      </div>

      {/* Lista detallada */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Ranking de Países</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sortedData.map((country, index) => (
            <div key={country.country_id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-bold text-gray-600">
                  {index + 1}
                </div>
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                <span className="text-sm font-medium">{country.country_name}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{country.total_stock.toLocaleString()} unidades</span>
                <span>{country.total_products} productos</span>
                <span className="text-blue-600 font-medium">{country.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Barra gruesa = Stock</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-2 bg-blue-500 opacity-60 rounded"></div>
            <span>Barra fina = Productos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCountriesChart;