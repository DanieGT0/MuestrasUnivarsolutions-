import React, { useState } from 'react';
import { Search, Filter, Calendar, Package, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ProductRotationTable = ({ data, title = "Detalle de Rotación por Producto" }) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMovement, setFilterMovement] = useState('all');
  const [sortBy, setSortBy] = useState('days_since_entry');
  const [sortOrder, setSortOrder] = useState('desc');

  if (!data || !data.products) {
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
          }`}>No hay datos de productos disponibles</p>
        </div>
      </div>
    );
  }

  const { products } = data;

  // Obtener categorías únicas para el filtro
  const categories = [...new Set(products.map(p => p.category_name))];

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category_name === filterCategory;
    
    const matchesMovement = 
      filterMovement === 'all' || 
      (filterMovement === 'fast' && product.is_fast_moving) ||
      (filterMovement === 'slow' && !product.is_fast_moving);

    return matchesSearch && matchesCategory && matchesMovement;
  });

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getMovementIcon = (isfast) => {
    return isfast ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getAgeColor = (days) => {
    if (days <= 30) {
      return isDarkMode 
        ? 'text-green-400 bg-green-900/30 border border-green-600/30'
        : 'text-green-600 bg-green-50';
    }
    if (days <= 60) {
      return isDarkMode 
        ? 'text-yellow-400 bg-yellow-900/30 border border-yellow-600/30'
        : 'text-yellow-600 bg-yellow-50';
    }
    if (days <= 90) {
      return isDarkMode 
        ? 'text-orange-400 bg-orange-900/30 border border-orange-600/30'
        : 'text-orange-600 bg-orange-50';
    }
    return isDarkMode 
      ? 'text-red-400 bg-red-900/30 border border-red-600/30'
      : 'text-red-600 bg-red-50';
  };

  return (
    <div className={`rounded-lg shadow-lg p-6 w-full ${
      isDarkMode ? 'glass-card' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>{title}</h3>
      
      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`theme-input w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
          />
        </div>

        {/* Filtro categoría */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="theme-input px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Filtro movimiento */}
        <select
          value={filterMovement}
          onChange={(e) => setFilterMovement(e.target.value)}
          className="theme-input px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="all">Todos los movimientos</option>
          <option value="fast">Movimiento rápido</option>
          <option value="slow">Movimiento lento</option>
        </select>

        {/* Información de resultados */}
        <div className={`flex items-center text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <Package className="h-4 w-4 mr-2" />
          {sortedProducts.length} productos
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={`${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <tr>
              <th 
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => handleSort('product_code')}
              >
                Producto {sortBy === 'product_code' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => handleSort('category_name')}
              >
                Categoría {sortBy === 'category_name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => handleSort('current_stock')}
              >
                Stock {sortBy === 'current_stock' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => handleSort('days_since_entry')}
              >
                Días en Stock {sortBy === 'days_since_entry' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => handleSort('velocity_per_day')}
              >
                Velocidad/día {sortBy === 'velocity_per_day' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                onClick={() => handleSort('rotation_rate')}
              >
                % Rotación {sortBy === 'rotation_rate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Tipo
              </th>
              <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Movimientos
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDarkMode 
              ? 'divide-gray-600' 
              : 'bg-white divide-gray-200'
          }`}>
            {sortedProducts.map((product) => (
              <tr key={product.product_id} className={`${
                isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}>
                <td className="px-4 py-3">
                  <div>
                    <div className={`font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>{product.product_code}</div>
                    <div className={`text-xs truncate max-w-32 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {product.product_name}
                    </div>
                  </div>
                </td>
                <td className={`px-4 py-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {product.category_name}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {product.current_stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAgeColor(product.days_since_entry)}`}>
                    {product.days_since_entry} días
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <TrendingUp className={`h-3 w-3 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>{product.velocity_per_day}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-medium ${
                    product.rotation_rate >= 50 ? 'text-green-600' :
                    product.rotation_rate >= 25 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {product.rotation_rate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {getMovementIcon(product.is_fast_moving)}
                    <span className={`text-xs font-medium ${
                      product.is_fast_moving ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.is_fast_moving ? 'Rápido' : 'Lento'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="text-xs">
                    <div className="text-green-600">↑ {product.total_entries}</div>
                    <div className="text-red-600">↓ {product.total_exits}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedProducts.length === 0 && (
          <div className={`text-center py-8 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No se encontraron productos con los filtros aplicados
          </div>
        )}
      </div>

      {/* Footer con información */}
      <div className={`mt-4 pt-4 border-t ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className={`flex flex-wrap gap-4 text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span>0-30 días (Nuevo)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded"></div>
            <span>31-60 días (Medio)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded"></div>
            <span>61-90 días (Viejo)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span>+90 días (Muy Viejo)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRotationTable;