import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, RefreshCw, Download, AlertTriangle, 
  ChevronLeft, ChevronRight, Package2, Calendar 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import reportService from '../../services/reportService';

const InventoryTable = () => {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState(null);
  const [error, setError] = useState(null);
  
  // Estados para filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [categories, setCategories] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Cargar datos de inventario
  const loadInventoryData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const offset = (page - 1) * itemsPerPage;
      
      const response = await reportService.getInventoryTable(
        selectedCategory,
        itemsPerPage,
        offset
      );
      
      setInventoryData(response);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Error loading inventory data:', err);
      setError('Error al cargar los datos del inventario');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías para el filtro
  const loadCategories = async () => {
    try {
      const response = await reportService.getStockByCategory();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Efectos
  useEffect(() => {
    loadCategories();
    loadInventoryData(1);
  }, [selectedCategory, itemsPerPage]);

  // Funciones de paginación
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadInventoryData(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (inventoryData?.page_info?.has_next) {
      loadInventoryData(currentPage + 1);
    }
  };

  // Función para refrescar datos
  const handleRefresh = () => {
    loadInventoryData(currentPage);
  };

  // Función para exportar a Excel
  const handleExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);

      // Obtener TODOS los productos (sin paginación) para exportar
      console.log('Exportando inventario completo...');
      
      // Hacer múltiples llamadas para obtener todos los productos
      let allProducts = [];
      let currentOffset = 0;
      const limitPerRequest = 500; // Máximo por petición
      let hasMore = true;

      while (hasMore && allProducts.length < 25000) { // Límite de seguridad
        try {
          const response = await reportService.getInventoryTable(
            selectedCategory, 
            limitPerRequest, 
            currentOffset
          );
          
          const products = response.products || [];
          allProducts = [...allProducts, ...products];
          
          hasMore = response.page_info?.has_next || false;
          currentOffset += limitPerRequest;
          
          console.log(`Obtenidos ${allProducts.length} productos...`);
          
          // Si obtenemos menos productos de los esperados, probablemente llegamos al final
          if (products.length < limitPerRequest) {
            hasMore = false;
          }
          
        } catch (error) {
          console.warn('Error en petición de productos:', error);
          hasMore = false;
        }
      }

      if (allProducts.length === 0) {
        alert('No hay productos para exportar');
        return;
      }

      // Mostrar advertencia si hay muchos registros
      if (allProducts.length > 10000) {
        const confirmExport = window.confirm(
          `Se exportarán ${allProducts.length.toLocaleString()} registros. Esto puede tomar un momento. ¿Continuar?`
        );
        if (!confirmExport) {
          return;
        }
      }

      console.log(`Exportando ${allProducts.length} productos a Excel...`);

      // Aplicar filtro de búsqueda a todos los productos
      const filteredForExport = allProducts.filter(product =>
        !searchTerm || (
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.pais_nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      // Crear libro de Excel
      const workbook = XLSX.utils.book_new();

      // Datos del Excel
      const worksheetData = [
        ['REPORTE DE INVENTARIOS COMPLETO'],
        ['Generado el:', new Date().toLocaleString('es-ES')],
        ['Total de productos:', filteredForExport.length.toLocaleString()],
        ['Filtro de categoría:', selectedCategory ? categories.find(c => c.category_id == selectedCategory)?.category_name || 'N/A' : 'Todas'],
        ['Filtro de búsqueda:', searchTerm || 'Sin filtro'],
        [''],
        ['Código', 'Nombre', 'Lote', 'Cantidad', 'Peso Unitario (kg)', 'Peso Total (kg)', 
         'Fecha Registro', 'Fecha Vencimiento', 'Proveedor', 'Responsable', 'Categoría', 
         'País', 'Estado Stock', 'Comentarios']
      ];

      // Agregar datos de productos
      filteredForExport.forEach(product => {
        worksheetData.push([
          product.codigo || '',
          product.nombre || '',
          product.lote || '',
          product.cantidad || 0,
          product.peso_unitario || '',
          product.peso_total || '',
          product.fecha_registro ? new Date(product.fecha_registro).toLocaleDateString('es-ES') : '',
          product.fecha_vencimiento ? new Date(product.fecha_vencimiento).toLocaleDateString('es-ES') : '',
          product.proveedor || '',
          product.responsable || '',
          product.categoria_nombre || '',
          product.pais_nombre || '',
          product.stock_status === 'critical' ? 'Crítico' : 
          product.stock_status === 'warning' ? 'Bajo' : 'Normal',
          product.comentarios || ''
        ]);
      });

      // Crear hoja de cálculo
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 15 }, // Código
        { wch: 30 }, // Nombre
        { wch: 15 }, // Lote
        { wch: 10 }, // Cantidad
        { wch: 12 }, // Peso Unit
        { wch: 12 }, // Peso Total
        { wch: 12 }, // Fecha Reg
        { wch: 12 }, // Fecha Venc
        { wch: 20 }, // Proveedor
        { wch: 20 }, // Responsable
        { wch: 15 }, // Categoría
        { wch: 15 }, // País
        { wch: 10 }, // Estado
        { wch: 30 }  // Comentarios
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

      // Generar nombre de archivo
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const categoryName = selectedCategory ? 
        categories.find(c => c.category_id == selectedCategory)?.category_name.replace(/[^a-zA-Z0-9]/g, '_') || 'Categoria' 
        : 'Todas';
      const fileName = `Inventario_${categoryName}_${timestamp}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, fileName);

      console.log(`Archivo Excel exportado: ${fileName} con ${filteredForExport.length} registros`);

    } catch (error) {
      console.error('Error al exportar inventario:', error);
      alert('Error al generar el archivo Excel. Por favor, intente de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Función para obtener el color del badge según el stock
  const getStockStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Función para obtener el texto del estado de stock
  const getStockStatusText = (status) => {
    switch (status) {
      case 'critical':
        return 'Crítico';
      case 'warning':
        return 'Bajo';
      default:
        return 'Normal';
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = inventoryData?.products?.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.pais_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Package2 className="h-8 w-8" />
                <span>Tabla de Inventarios</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Vista completa del inventario por país y categoría
              </p>
            </div>
            
            {/* Controles */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
              
              <button
                onClick={handleExport}
                disabled={loading || isExporting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  loading || isExporting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Download className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
                <span>{isExporting ? 'Exportando...' : 'Exportar Excel'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código, categoría o país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filtro por categoría */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Items por página */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span className="text-sm text-gray-600">por página</span>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {inventoryData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Productos</div>
              <div className="text-2xl font-bold text-blue-600">
                {inventoryData.total_count.toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Página Actual</div>
              <div className="text-2xl font-bold text-gray-800">
                {currentPage}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Stock Crítico</div>
              <div className="text-2xl font-bold text-red-600">
                {filteredProducts.filter(p => p.stock_status === 'critical').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Stock Bajo</div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredProducts.filter(p => p.stock_status === 'warning').length}
              </div>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando inventario...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        País
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No se encontraron productos
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.nombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.codigo}
                                {product.lote && ` - Lote: ${product.lote}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.cantidad.toLocaleString()}
                            </div>
                            {(product.peso_unitario || product.peso_total) && (
                              <div className="text-sm text-gray-500">
                                {product.peso_unitario && `Unit: ${product.peso_unitario}kg`}
                                {product.peso_total && ` Total: ${product.peso_total}kg`}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.categoria_nombre}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.pais_nombre}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {product.fecha_registro && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Reg: {new Date(product.fecha_registro).toLocaleDateString()}</span>
                                </div>
                              )}
                              {product.fecha_vencimiento && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Venc: {new Date(product.fecha_vencimiento).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{product.proveedor}</div>
                            {product.responsable && (
                              <div className="text-sm text-gray-500">{product.responsable}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStockStatusColor(product.stock_status)}`}>
                              {getStockStatusText(product.stock_status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {inventoryData && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!inventoryData.page_info.has_prev}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={!inventoryData.page_info.has_next}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Mostrando{' '}
                          <span className="font-medium">{inventoryData.page_info.offset + 1}</span>
                          {' '}a{' '}
                          <span className="font-medium">
                            {Math.min(
                              inventoryData.page_info.offset + inventoryData.page_info.limit,
                              inventoryData.total_count
                            )}
                          </span>
                          {' '}de{' '}
                          <span className="font-medium">{inventoryData.total_count}</span>
                          {' '}resultados
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={handlePreviousPage}
                            disabled={!inventoryData.page_info.has_prev}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            {currentPage}
                          </span>
                          <button
                            onClick={handleNextPage}
                            disabled={!inventoryData.page_info.has_next}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString('es-ES')}
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;