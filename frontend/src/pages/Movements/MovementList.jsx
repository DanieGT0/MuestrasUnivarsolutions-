import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Minus, RotateCcw, Eye, Calendar, User, Package, Download, 
  MapPin, ChevronLeft, ChevronRight, TrendingUp, ArrowUpDown, Building2, Clock, 
  BarChart3, Users, AlertCircle, CheckCircle2, Globe2, RefreshCw, X, SlidersHorizontal
} from 'lucide-react';
import * as XLSX from 'xlsx';
import movementService from '../../services/movementService';
import userService from '../../services/userService';
import authService from '../../services/authService';
import EntradaForm from '../../components/forms/EntradaForm';
import SalidaForm from '../../components/forms/SalidaForm';
import { 
  Card, CardHeader, CardContent, Button, Badge, Alert, ProgressBar, PageHeader
} from '../../components/ui';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';

// Professional Stats Card
const StatsCard = ({ title, value, subtitle, trend, icon: Icon, color = "blue" }) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${
                trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Professional Movement Badge
const MovementBadge = ({ type }) => {
  const { t } = useTranslation();
  const getTypeConfig = () => {
    switch (type) {
      case 'entrada':
        return { variant: 'success', label: t('movements.entry', 'Entry'), icon: Plus };
      case 'salida':
        return { variant: 'danger', label: t('movements.exit', 'Exit'), icon: Minus };
      case 'ajuste':
        return { variant: 'info', label: t('movements.adjustment', 'Adjustment'), icon: RotateCcw };
      case 'inicial':
        return { variant: 'secondary', label: t('movements.initialStock', 'Initial Stock'), icon: Package };
      default:
        return { variant: 'secondary', label: type, icon: Package };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Professional Movement Table
const MovementTable = ({ movements, onView, loading }) => {
  const { t } = useTranslation();
  return (
  <Card>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('movements.type', 'Type')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('products.title', 'Product')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cambio
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actualización de Stock
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Responsable
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('common.date', 'Date')}
            </th>
            <th className="relative px-6 py-4">
              <span className="sr-only">{t('common.actions', 'Actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-gray-500">Cargando movimientos...</span>
                </div>
              </td>
            </tr>
          ) : movements.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center">
                <div className="space-y-4">
                  <ArrowUpDown className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">No se encontraron movimientos</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Intente ajustar su búsqueda o criterios de filtro
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <MovementBadge type={movement.tipo} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.product_codigo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {movement.product_nombre}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className={`font-medium ${
                      movement.diferencia > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.diferencia > 0 ? '+' : ''}{movement.diferencia?.toLocaleString()}
                    </div>
                    <div className="text-gray-500">Cant.: {movement.cantidad?.toLocaleString()}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">{movement.cantidad_anterior?.toLocaleString()}</span>
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    <span className="font-medium text-gray-900">{movement.cantidad_nueva?.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{movement.responsable}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(movement.fecha_movimiento).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(movement.fecha_movimiento).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(movement)}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </Card>
  );
};

const MovementList = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: '',
    country_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [countries, setCountries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showExportLoading, setShowExportLoading] = useState(false);
  const [showEntradaForm, setShowEntradaForm] = useState(false);
  const [showSalidaForm, setShowSalidaForm] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalMovements, setTotalMovements] = useState(0);
  const [stats, setStats] = useState({
    totalMovements: 0,
    entries: 0,
    exits: 0,
    adjustments: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load stats
  const loadStats = async () => {
    try {
      const allMovements = await movementService.getMovements({ limit: 10000 });
      
      const stats = {
        totalMovements: allMovements.length,
        entries: allMovements.filter(m => m.tipo === 'entrada').length,
        exits: allMovements.filter(m => m.tipo === 'salida').length,
        adjustments: allMovements.filter(m => m.tipo === 'ajuste').length
      };
      
      setStats(stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadMovements();
    loadStats();
  }, [searchTerm, filters, currentPage]);

  const loadInitialData = async () => {
    try {
      // Obtener datos del usuario actual
      const userData = authService.getUserData();
      setCurrentUser(userData);

      // Cargar países disponibles
      const countriesData = await userService.getCountries();
      setCountries(countriesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * itemsPerPage;
      
      const params = {
        search: searchTerm || undefined,
        tipo: filters.tipo || undefined,
        country_id: filters.country_id || undefined,
        fecha_desde: filters.fecha_desde || undefined,
        fecha_hasta: filters.fecha_hasta || undefined,
        skip,
        limit: itemsPerPage
      };
      
      // Debug: log de parámetros
      console.log('Loading movements with params:', params);
      
      const response = await movementService.getMovements(params);
      setMovements(response);
      
      // Para calcular el total, hacer una consulta adicional sin limit
      const totalParams = {
        search: searchTerm || undefined,
        tipo: filters.tipo || undefined,
        country_id: filters.country_id || undefined,
        fecha_desde: filters.fecha_desde || undefined,
        fecha_hasta: filters.fecha_hasta || undefined,
        limit: 1000 // Usar un límite alto para contar
      };
      
      const totalResponse = await movementService.getMovements(totalParams);
      setTotalMovements(totalResponse.length);
      
    } catch (error) {
      console.error('Error loading movements:', error);
      setError('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    console.log(`[FRONTEND] Filter change: ${filterName} = ${value}`);
    setCurrentPage(1); // Reset a la primera página cuando cambian los filtros
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterName]: value
      };
      console.log('[FRONTEND] New filters state:', newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1); // Reset a la primera página
    setFilters({
      tipo: '',
      country_id: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
  };

  // Funciones para la paginación
  const totalPages = Math.ceil(totalMovements / itemsPerPage);
  
  const goToPage = (page) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Verificar si el usuario puede ver el filtro de país
  const canFilterByCountry = () => {
    if (!currentUser) return false;
    
    // Los administradores siempre pueden filtrar por país
    if (currentUser.role?.name === 'admin') return true;
    
    // Los usuarios que tienen acceso a múltiples países pueden filtrar
    // Esto necesitaría verificarse con los países asignados del usuario
    // Por ahora asumimos que pueden filtrar si no están restringidos a un solo país
    return currentUser.countries && currentUser.countries.length > 1;
  };

  // Función para exportar a Excel en formato XLSX
  const exportToExcel = async () => {
    try {
      setShowExportLoading(true);
      
      // Obtener todos los movimientos sin paginación para export
      const params = {
        search: searchTerm || undefined,
        tipo: filters.tipo || undefined,
        country_id: filters.country_id || undefined,
        fecha_desde: filters.fecha_desde || undefined,
        fecha_hasta: filters.fecha_hasta || undefined,
        limit: 25000 // Máximo permitido por el backend
      };
      
      const exportData = await movementService.getMovements(params);
      
      // Alerta si se alcanzó el límite máximo
      if (exportData.length === 25000) {
        alert('⚠️ Se exportaron 25,000 registros (límite máximo). Puede haber más movimientos no incluidos. Considere aplicar filtros de fecha para reducir el conjunto de datos.');
      }
      
      // Preparar datos para el archivo XLSX
      const worksheetData = [
        // Encabezados
        [
          t('common.date', 'Date'),
          t('movements.type', 'Type'),
          t('products.code', 'Product Code'),
          t('products.name', 'Product Name'),
          t('common.quantity', 'Quantity'),
          'Stock Anterior',
          'Stock Nuevo',
          'Responsable',
          'Motivo',
          'Observaciones'
        ],
        // Datos
        ...exportData.map(movement => [
          formatDate(movement.fecha_movimiento),
          movementService.MOVEMENT_TYPE_LABELS[movement.tipo] || movement.tipo,
          movement.product_codigo,
          movement.product_nombre,
          movement.cantidad,
          movement.cantidad_anterior,
          movement.cantidad_nueva,
          movement.responsable,
          movement.motivo,
          movement.observaciones || ''
        ])
      ];
      
      // Crear el workbook y worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Configurar anchos de columnas
      const columnWidths = [
        { wch: 20 }, // Fecha
        { wch: 15 }, // Tipo
        { wch: 15 }, // Código Producto
        { wch: 30 }, // Nombre Producto
        { wch: 10 }, // Cantidad
        { wch: 12 }, // Stock Anterior
        { wch: 12 }, // Stock Nuevo
        { wch: 20 }, // Responsable
        { wch: 30 }, // Motivo
        { wch: 30 }  // Observaciones
      ];
      worksheet['!cols'] = columnWidths;
      
      // Agregar el worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Movements');
      
      // Generar el archivo y descargarlo
      const fileName = `movements_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Error al exportar datos');
    } finally {
      setShowExportLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSuccess = () => {
    setShowEntradaForm(false);
    setShowSalidaForm(false);
    loadMovements();
    loadStats();
  };

  if (showEntradaForm) {
    return (
      <EntradaForm
        onSuccess={handleSuccess}
        onCancel={() => setShowEntradaForm(false)}
      />
    );
  }

  if (showSalidaForm) {
    return (
      <SalidaForm
        onSuccess={handleSuccess}
        onCancel={() => setShowSalidaForm(false)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50/50'}`}>
      {/* Professional Header */}
      <PageHeader
        title={t('movements.title', 'Inventory Movements')}
        description={t('movements.subtitle', 'Complete record of entries and exits')}
        icon={ArrowUpDown}
        badge={
          <Badge variant="info" className="flex items-center space-x-1">
            <Globe2 className="h-3 w-3" />
            <span>Operaciones Globales</span>
          </Badge>
        }
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              onClick={exportToExcel}
              disabled={showExportLoading || movements.length === 0}
              loading={showExportLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
            <Button
              variant="success"
              onClick={() => setShowEntradaForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('movements.entry', 'Entry')}
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowSalidaForm(true)}
            >
              <Minus className="h-4 w-4 mr-2" />
              {t('movements.exit', 'Exit')}
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total de Movimientos"
              value={stats.totalMovements.toLocaleString()}
              icon={BarChart3}
              color="blue"
            />
            <StatsCard
              title={t('movements.entry', 'Entries')}
              value={stats.entries.toLocaleString()}
              subtitle="Adiciones de stock"
              icon={Plus}
              color="green"
            />
            <StatsCard
              title={t('movements.exit', 'Exits')}
              value={stats.exits.toLocaleString()}
              subtitle="Reducciones de stock"
              icon={Minus}
              color="red"
            />
            <StatsCard
              title={t('movements.adjustment', 'Adjustments')}
              value={stats.adjustments.toLocaleString()}
              subtitle="Correcciones de stock"
              icon={RotateCcw}
              color="yellow"
            />
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar productos, códigos o persona responsable..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>{t('common.filter', 'Filters')}</span>
                    {(filters.tipo || filters.country_id || filters.fecha_desde || filters.fecha_hasta) && (
                      <Badge variant="primary" className="ml-2">
                        {[filters.tipo, filters.country_id, filters.fecha_desde, filters.fecha_hasta].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => { loadMovements(); loadStats(); }}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{t('common.refresh', 'Refresh')}</span>
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Movimiento
                      </label>
                      <select
                        value={filters.tipo}
                        onChange={(e) => handleFilterChange('tipo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Todos los tipos</option>
                        <option value="entrada">{t('movements.entry', 'Entries')}</option>
                        <option value="salida">{t('movements.exit', 'Exits')}</option>
                        <option value="ajuste">{t('movements.adjustment', 'Adjustments')}</option>
                        <option value="inicial">{t('movements.initialStock', 'Initial Stock')}</option>
                      </select>
                    </div>
                    
                    {canFilterByCountry() && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('settings.tabs.countries.country', 'Country')}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <select
                            value={filters.country_id}
                            onChange={(e) => handleFilterChange('country_id', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Todos los Países</option>
                            {countries.map(country => (
                              <option key={country.id} value={country.id}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Desde
                      </label>
                      <input
                        type="date"
                        value={filters.fecha_desde}
                        onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Hasta
                      </label>
                      <input
                        type="date"
                        value={filters.fecha_hasta}
                        onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Limpiar Filtros</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="error">
              <div>
                <h4 className="font-semibold mb-1">{t('common.error', 'Error')}</h4>
                <p>{error}</p>
              </div>
            </Alert>
          )}

          {/* Movements Table */}
          <MovementTable
            movements={movements}
            onView={setSelectedMovement}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
                    {Math.min(currentPage * itemsPerPage, totalMovements)} de{' '}
                    {totalMovements.toLocaleString()} movimientos
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, currentPage - 2) + i;
                        return page <= totalPages ? (
                          <Button
                            key={page}
                            variant={page === currentPage ? "primary" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </Button>
                        ) : null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Movement Detail Modal */}
      {selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Detalles del Movimiento
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMovement(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('movements.type', 'Type')}</label>
                    <MovementBadge type={selectedMovement.tipo} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.date', 'Date')}</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {formatDate(selectedMovement.fecha_movimiento)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('products.title', 'Product')}</label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedMovement.product_codigo}</p>
                        <p className="text-xs text-gray-500">{selectedMovement.product_nombre}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedMovement.responsable}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cambio de Cantidad</label>
                    <p className={`text-sm font-medium ${
                      selectedMovement.diferencia > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedMovement.diferencia > 0 ? '+' : ''}{selectedMovement.diferencia?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actualización de Stock</label>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">{selectedMovement.cantidad_anterior?.toLocaleString()}</span>
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-gray-900">{selectedMovement.cantidad_nueva?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedMovement.motivo}
                  </p>
                </div>
                
                {selectedMovement.observaciones && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedMovement.observaciones}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementList;