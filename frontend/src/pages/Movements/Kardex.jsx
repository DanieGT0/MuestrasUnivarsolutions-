import React, { useState, useEffect } from 'react';
import { Search, Package, Calendar, User, FileText, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import movementService from '../../services/movementService';
import productService from '../../services/productService';
import { useTheme } from '../../contexts/ThemeContext';

const Kardex = () => {
  const { isDarkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [kardexData, setKardexData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 }); // Get all products for Kardex
      // Check if response has pagination structure
      if (response && typeof response === 'object' && response.items) {
        setProducts(response.items);
      } else {
        // Fallback for simple array response
        setProducts(response || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Error al cargar productos');
    }
  };

  const loadKardex = async (productId) => {
    try {
      setLoading(true);
      setError('');
      const response = await movementService.getKardexByProduct(productId);
      setKardexData(response);
    } catch (error) {
      console.error('Error loading kardex:', error);
      setError('Error al cargar el Kardex');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    loadKardex(product.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Formatear fecha sin conversión de timezone adicional
    // porque el backend ya guarda en hora local de Centro América
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeIcon = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'salida':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ajuste':
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementTypeColor = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return 'text-green-600';
      case 'salida':
        return 'text-red-600';
      case 'ajuste':
        return 'text-blue-600';
      case 'inicial':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getStats = () => {
    if (!kardexData || !kardexData.movimientos) return null;

    // Contar número de operaciones (movimientos), no cantidades
    // Incluir movimientos de tipo 'inicial' como entradas
    const totalEntradas = kardexData.movimientos
      .filter(m => m.tipo === 'entrada' || m.tipo === 'inicial').length;

    const totalSalidas = kardexData.movimientos
      .filter(m => m.tipo === 'salida').length;

    const totalMovimientos = kardexData.movimientos.length;

    // Para mostrar también las cantidades totales
    // Incluir movimientos de tipo 'inicial' como entradas
    const cantidadTotalEntradas = kardexData.movimientos
      .filter(m => m.tipo === 'entrada' || m.tipo === 'inicial')
      .reduce((sum, m) => sum + m.cantidad_movimiento, 0);

    const cantidadTotalSalidas = kardexData.movimientos
      .filter(m => m.tipo === 'salida')
      .reduce((sum, m) => sum + m.cantidad_movimiento, 0);

    // Verificar coherencia del stock
    const ultimoMovimiento = kardexData.movimientos.length > 0 
      ? kardexData.movimientos[kardexData.movimientos.length - 1] 
      : null;
    
    const stockCalculado = ultimoMovimiento ? ultimoMovimiento.saldo : 0;
    const stockProducto = kardexData.saldo_actual;
    const stockCoherente = stockCalculado === stockProducto;

    // Verificar que el stock del producto mostrado en la lista coincide
    const stockListaProducto = selectedProduct ? selectedProduct.cantidad : null;
    const stockListaCoherente = stockListaProducto === stockProducto;

    return {
      totalEntradas,
      totalSalidas,
      totalMovimientos,
      saldoActual: kardexData.saldo_actual,
      cantidadTotalEntradas,
      cantidadTotalSalidas,
      stockCalculado,
      stockCoherente,
      stockListaProducto,
      stockListaCoherente,
      inconsistencias: !stockCoherente || !stockListaCoherente
    };
  };

  const stats = getStats();

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Kardex de Productos
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Historial completo de movimientos por producto
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de productos */}
        <div className="lg:col-span-1">
          <div className={`rounded-lg shadow p-4 ${isDarkMode ? 'glass-card' : 'bg-white'}`}>
            <h3 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Seleccionar Producto
            </h3>
            
            {/* Busqueda */}
            <div className="relative mb-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`theme-input w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 transition-colors ${
                  isDarkMode ? 'focus:ring-blue-400' : 'focus:ring-blue-500'
                }`}
              />
            </div>

            {/* Lista de productos */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    selectedProduct?.id === product.id
                      ? isDarkMode
                        ? 'bg-theme-primary-light border-theme-primary text-theme-primary'
                        : 'bg-blue-50 border-blue-200'
                      : isDarkMode
                        ? 'border-gray-600 hover:bg-gray-700'
                        : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`font-medium text-sm ${
                    selectedProduct?.id === product.id 
                      ? isDarkMode ? 'text-theme-primary' : 'text-gray-900'
                      : isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {product.codigo}
                  </div>
                  <div className={`text-xs truncate ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {product.nombre}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Stock: {product.cantidad}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kardex */}
        <div className="lg:col-span-2">
          {!selectedProduct ? (
            <div className={`rounded-lg shadow p-8 text-center ${
              isDarkMode ? 'glass-card' : 'bg-white'
            }`}>
              <Package className={`h-12 w-12 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Selecciona un producto para ver su Kardex
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informacion del producto */}
              <div className={`rounded-lg shadow p-6 ${isDarkMode ? 'glass-card' : 'bg-white'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Package className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedProduct.codigo}
                    </h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedProduct.nombre}
                    </p>
                  </div>
                </div>

                {/* Estad�sticas */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Entradas */}
                    <div 
                      className={`text-center p-3 rounded-lg cursor-help ${
                        isDarkMode ? 'bg-green-900/20 border border-green-600/30' : 'bg-green-50'
                      }`}
                      title={`${stats.totalEntradas} operaciones de entrada (${stats.cantidadTotalEntradas} unidades totales)`}
                    >
                      <div className="text-2xl font-bold text-green-600">{stats.totalEntradas}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                        Operaciones de Entrada
                      </div>
                      <div className="text-xs text-green-600 mt-1">{stats.cantidadTotalEntradas} unidades</div>
                    </div>
                    
                    {/* Salidas */}
                    <div 
                      className={`text-center p-3 rounded-lg cursor-help ${
                        isDarkMode ? 'bg-red-900/20 border border-red-600/30' : 'bg-red-50'
                      }`}
                      title={`${stats.totalSalidas} operaciones de salida (${stats.cantidadTotalSalidas} unidades totales)`}
                    >
                      <div className="text-2xl font-bold text-red-600">{stats.totalSalidas}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                        Operaciones de Salida
                      </div>
                      <div className="text-xs text-red-600 mt-1">{stats.cantidadTotalSalidas} unidades</div>
                    </div>
                    
                    {/* Movimientos */}
                    <div className={`text-center p-3 rounded-lg ${
                      isDarkMode ? 'bg-blue-900/20 border border-blue-600/30' : 'bg-blue-50'
                    }`}>
                      <div className="text-2xl font-bold text-blue-600">{stats.totalMovimientos}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        Movimientos
                      </div>
                    </div>
                    
                    {/* Stock Actual */}
                    <div className={`text-center p-3 rounded-lg ${
                      stats.inconsistencias 
                        ? isDarkMode 
                          ? 'bg-yellow-900/20 border-2 border-yellow-600/30' 
                          : 'bg-yellow-50 border-2 border-yellow-300'
                        : isDarkMode 
                          ? 'bg-gray-700/50 border border-gray-600' 
                          : 'bg-gray-50'
                    }`}>
                      <div className={`text-2xl font-bold ${
                        stats.inconsistencias 
                          ? isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {stats.saldoActual}
                      </div>
                      <div className={`text-sm ${
                        stats.inconsistencias 
                          ? isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                          : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Stock Actual
                      </div>
                      {stats.inconsistencias && (
                        <div className={`text-xs mt-1 ${
                          isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                        }`}>
                          ⚠ Posible inconsistencia
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Panel de debug si hay inconsistencias */}
                {stats && stats.inconsistencias && (
                  <div className={`mt-4 p-3 rounded border-l-4 ${
                    isDarkMode 
                      ? 'bg-yellow-900/20 border-yellow-600' 
                      : 'bg-yellow-50 border-yellow-400'
                  }`}>
                    <div className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                      <strong>Informacion de Debug:</strong>
                      <div className="mt-1 space-y-1 text-xs">
                        <div>Stock en tabla de productos: <strong>{stats.stockListaProducto}</strong></div>
                        <div>Stock en kardex (saldo_actual): <strong>{stats.saldoActual}</strong></div>
                        <div>Stock calculado (ultimo movimiento): <strong>{stats.stockCalculado}</strong></div>
                        <div>Coherencia kardex vs movimientos: <strong>{stats.stockCoherente ? '✓' : '✗'}</strong></div>
                        <div>Coherencia lista vs kardex: <strong>{stats.stockListaCoherente ? '✓' : '✗'}</strong></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Historial de movimientos */}
              <div className={`rounded-lg shadow ${isDarkMode ? 'glass-card' : 'bg-white'}`}>
                <div className={`p-6 border-b ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Historial de Movimientos
                  </h3>
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <div className={`animate-spin h-8 w-8 border-4 border-t-transparent rounded-full mx-auto ${
                      isDarkMode ? 'border-blue-400' : 'border-blue-500'
                    }`}></div>
                    <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Cargando Kardex...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-600">
                    <p>{error}</p>
                  </div>
                ) : kardexData && kardexData.movimientos.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className={`h-12 w-12 mx-auto mb-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      No hay movimientos registrados
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Fecha
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Tipo
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Motivo
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Responsable
                          </th>
                          <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Cantidad
                          </th>
                          <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Stock Anterior
                          </th>
                          <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            Stock Nuevo
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                      }`}>
                        {kardexData?.movimientos.map((movement) => (
                          <tr key={movement.id} className={`${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          } transition-colors`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className={`h-4 w-4 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                }`} />
                                <span className={`text-sm ${
                                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                }`}>
                                  {formatDate(movement.fecha)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getMovementTypeIcon(movement.tipo)}
                                <span className={`text-sm font-medium ${getMovementTypeColor(movement.tipo)}`}>
                                  {movementService.MOVEMENT_TYPE_LABELS[movement.tipo]}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`text-sm ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                                {movement.motivo}
                              </div>
                              {movement.observaciones && (
                                <div className={`text-xs mt-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {movement.observaciones}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <User className={`h-4 w-4 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                }`} />
                                <span className={`text-sm ${
                                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                }`}>
                                  {movement.responsable}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-sm font-medium ${
                                movement.tipo === 'entrada' || movement.tipo === 'inicial' ? 'text-green-600' : 
                                movement.tipo === 'salida' ? 'text-red-600' : 'text-blue-600'
                              }`}>
                                {movement.tipo === 'entrada' || movement.tipo === 'inicial' ? '+' : movement.tipo === 'salida' ? '-' : '±'}
                                {movement.cantidad_movimiento}
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {movement.cantidad_anterior}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-200' : 'text-gray-900'
                              }`}>
                                {movement.saldo}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Kardex;