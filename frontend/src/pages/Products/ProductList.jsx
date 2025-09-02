import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, Eye, Download,
  Calendar, Package, AlertTriangle, CheckCircle2, ChevronDown,
  X, Clock, Globe2, MoreHorizontal, RefreshCw, SlidersHorizontal,
  TrendingUp, Users, Building2, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import productService from '../../services/productService';
import ProductAdapter from '../../adapters/productAdapter';
import authService from '../../services/authService';
import ProductFormComponent from '../../components/forms/ProductForm';
import { 
  Card, CardHeader, CardContent, Button, Badge, Alert, ProgressBar, PageHeader
} from '../../components/ui';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';

// Professional Status Badge Component
const StatusBadge = ({ status, daysUntilExpiry }) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  const getStatusConfig = () => {
    if (status === 'vencido' || daysUntilExpiry < 0) {
      return { 
        variant: 'danger', 
        label: t('common.expired', 'Expired'), 
        icon: AlertTriangle,
        bgColor: isDarkMode ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2',
        textColor: isDarkMode ? '#ef4444' : '#991b1b'
      };
    } else if (status === 'por_vencer' || daysUntilExpiry <= 30) {
      return { 
        variant: 'warning', 
        label: t('common.expiringSoon', 'Expiring Soon'), 
        icon: Clock,
        bgColor: isDarkMode ? 'rgba(217, 119, 6, 0.2)' : '#fef3c7',
        textColor: isDarkMode ? '#f59e0b' : '#92400e'
      };
    } else {
      return { 
        variant: 'success', 
        label: t('common.active', 'Active'), 
        icon: CheckCircle2,
        bgColor: isDarkMode ? 'rgba(5, 150, 105, 0.2)' : '#dcfce7',
        textColor: isDarkMode ? '#10b981' : '#166534'
      };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span 
      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full"
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor
      }}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

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

// Professional Table Component
const ProductTable = ({ products, onEdit, onDelete, onView, loading }) => {
  const { t } = useTranslation();
  return (
  <Card>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('products.title', 'Product')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('products.details', 'Details')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('products.inventory', 'Inventory')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('common.status', 'Status')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('products.location', 'Location')}
            </th>
            <th className="relative px-6 py-4">
              <span className="sr-only">{t('common.actions', 'Actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-gray-500">{t('products.loading', 'Loading products...')}</span>
                </div>
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <div className="space-y-4">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t('products.noProductsFound', 'No products found')}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('products.adjustSearchFilter', 'Try adjusting your search or filter criteria')}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        Code: {product.codigo}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{t('settings.tabs.import.lot', 'Lot')}: {product.lote}</div>
                  <div className="text-sm text-gray-500">
                    {t('products.supplier', 'Supplier')}: {product.proveedor || t('common.notAvailable', 'N/A')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Qty: {product.cantidad?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('settings.tabs.import.totalWeight', 'Weight')}: {product.peso_total || 0} kg
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge 
                    status={product.estado_vencimiento} 
                    daysUntilExpiry={product.dias_para_vencer} 
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Exp: {new Date(product.fecha_vencimiento).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Building2 className="h-4 w-4 mr-1" />
                    {product.country_nombre || t('common.unknown', 'Unknown')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.categoria_nombre || t('products.noCategory', 'No Category')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(product)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(product)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(product.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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

// Main ProductList Component
const ProductList = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0
  });
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  const itemsPerPage = 25;

  // Load products
  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        categoria: filterCategory || undefined,
        estado_vencimiento: filterStatus || undefined,
        skip: (page - 1) * itemsPerPage,
        limit: itemsPerPage
      };

      const response = await productService.getProducts(params);
      
      if (response && typeof response === 'object' && response.items) {
        const adaptedProducts = ProductAdapter.fromBackendList(response.items);
        setProducts(adaptedProducts);
        setTotalProducts(response.total || 0);
      } else {
        const adaptedProducts = ProductAdapter.fromBackendList(response || []);
        setProducts(adaptedProducts);
        setTotalProducts(adaptedProducts.length);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const allProducts = await productService.getProducts({ limit: 10000 });
      const productsList = allProducts?.items || allProducts || [];
      
      const stats = {
        total: productsList.length,
        active: productsList.filter(p => !p.estado_vencimiento || p.estado_vencimiento === 'vigente').length,
        expiringSoon: productsList.filter(p => p.estado_vencimiento === 'por_vencer').length,
        expired: productsList.filter(p => p.estado_vencimiento === 'vencido').length
      };
      
      setStats(stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  useEffect(() => {
    loadProducts(currentPage);
    loadStats();
  }, [searchTerm, filterCategory, filterStatus, currentPage]);

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
  };

  const handleDelete = async (productId) => {
    if (window.confirm(t('products.confirmDelete', 'Are you sure you want to delete this product?'))) {
      try {
        setLoading(true);
        await productService.deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
        await loadStats();
      } catch (err) {
        setError(err.message);
        console.error('Error deleting product:', err);
        alert(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportToExcel = async () => {
    try {
      setLoading(true);
      
      const params = {
        search: searchTerm || undefined,
        categoria: filterCategory || undefined,
        estado_vencimiento: filterStatus || undefined,
        skip: 0,
        limit: 1000
      };
      
      const response = await productService.getProducts(params);
      let exportData = [];
      
      if (response && typeof response === 'object' && response.items) {
        exportData = ProductAdapter.fromBackendList(response.items);
      } else {
        exportData = ProductAdapter.fromBackendList(response);
      }
      
      if (exportData.length === 1000) {
        alert(t('products.exportLimitWarning', '⚠️ Exported first 1,000 records (export limit). Consider applying filters to reduce the dataset.'));
      }

      const worksheetData = [
        [
          t('products.code', 'Code'), t('products.name', 'Name'), t('settings.tabs.import.lot', 'Lot'), 
          t('common.quantity', 'Quantity'), t('settings.tabs.import.unitWeight', 'Unit Weight (Kg)'),
          t('settings.tabs.import.totalWeight', 'Total Weight (Kg)'), t('common.date', 'Registration Date'), 
          t('settings.tabs.import.expirationDate', 'Expiration Date'),
          t('products.supplier', 'Supplier'), t('settings.tabs.import.responsible', 'Responsible'), 
          t('products.category', 'Category'), t('settings.tabs.countries.country', 'Country'), 
          t('common.status', 'Status'), t('settings.tabs.import.comments', 'Comments')
        ],
        ...exportData.map(product => {
          let status = t('common.active', 'Active');
          if (product.estado_vencimiento) {
            status = product.estado_vencimiento.replace('_', ' ').charAt(0).toUpperCase() + 
                    product.estado_vencimiento.replace('_', ' ').slice(1);
          } else {
            const today = new Date();
            const expiry = new Date(product.fecha_vencimiento);
            const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry < 0) {
              status = t('common.expired', 'Expired');
            } else if (daysUntilExpiry <= 30) {
              status = t('common.expiringSoon', 'Expiring Soon');
            } else {
              status = t('common.active', 'Active');
            }
          }
          
          const formatDisplayDate = (date) => {
            if (!date) return t('common.notAvailable', 'N/A');
            return new Date(date).toLocaleDateString();
          };
          
          return [
            product.codigo,
            product.nombre,
            product.lote,
            product.cantidad,
            product.peso_unitario,
            product.peso_total,
            formatDisplayDate(product.fecha_registro),
            formatDisplayDate(product.fecha_vencimiento),
            product.proveedor,
            product.responsable,
            product.categoria_nombre || product.categoria || t('common.notAvailable', 'N/A'),
            product.country_nombre || t('common.notAvailable', 'N/A'),
            status,
            product.comentarios || ''
          ];
        })
      ];
      
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      const columnWidths = [
        { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 },
        { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }
      ];
      worksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, t('navigation.products', 'Products'));
      
      const fileName = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (err) {
      setError(err.message);
      console.error('Error exporting products:', err);
      alert(`Export error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50/50'}`}>
      {/* Professional Header */}
      <PageHeader
        title={t('products.title', 'Product Management')}
        description={t('products.subtitle', 'Manage your product inventory and track expiration dates across global locations')}
        icon={Package}
        badge={
          <Badge variant="info" className="flex items-center space-x-1">
            <Globe2 className="h-3 w-3" />
            <span>{t('settings.tabs.import.platform', 'Global Platform')}</span>
          </Badge>
        }
        actions={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title={t('dashboard.stats.totalProducts', 'Total Products')}
              value={stats.total.toLocaleString()}
              icon={Package}
              color="blue"
            />
            <StatsCard
              title={t('products.stats.activeProducts', 'Active Products')}
              value={stats.active.toLocaleString()}
              subtitle={t('products.stats.inGoodCondition', 'In good condition')}
              icon={CheckCircle2}
              color="green"
            />
            <StatsCard
              title={t('products.stats.expiringSoon', 'Expiring Soon')}
              value={stats.expiringSoon.toLocaleString()}
              subtitle={t('products.stats.within30Days', 'Within 30 days')}
              icon={Clock}
              color="yellow"
            />
            <StatsCard
              title={t('products.stats.expired', 'Expired')}
              value={stats.expired.toLocaleString()}
              subtitle={t('products.stats.needAttention', 'Need attention')}
              icon={AlertTriangle}
              color="red"
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
                      placeholder="Search products, codes, lots, or suppliers..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filters</span>
                    {(filterCategory || filterStatus) && (
                      <Badge variant="primary" className="ml-2">
                        {[filterCategory, filterStatus].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => loadProducts(currentPage)}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleExportToExcel}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={filterCategory}
                        onChange={(e) => {
                          setFilterCategory(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">{t('products.allCategories', 'All Categories')}</option>
                        <option value="HIC">HIC</option>
                        <option value="BIC">BIC</option>
                        <option value="CASE">CASE</option>
                        <option value="FOOD">FOOD</option>
                        <option value="PHARMA">PHARMA</option>
                        <option value="OTROS">{t('products.categories.others', 'Others')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">All Status</option>
                        <option value="vigente">Active</option>
                        <option value="por_vencer">Expiring Soon</option>
                        <option value="vencido">Expired</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFilterCategory('');
                          setFilterStatus('');
                          setCurrentPage(1);
                        }}
                        className="flex items-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Clear Filters</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="error">
              <div>
                <h4 className="font-semibold mb-1">Error</h4>
                <p>{error}</p>
              </div>
            </Alert>
          )}

          {/* Products Table */}
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalProducts)} of{' '}
                    {totalProducts.toLocaleString()} products
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, currentPage - 2) + i;
                        return page <= totalPages ? (
                          <Button
                            key={page}
                            variant={page === currentPage ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ) : null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? t('products.editProduct', 'Edit Product') : t('products.addProduct', 'Add Product')}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <ProductFormComponent
                product={editingProduct}
                onSubmit={async (product) => {
                  setShowForm(false);
                  setEditingProduct(null);
                  loadProducts(currentPage);
                  loadStats();
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Product View Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {viewingProduct.nombre}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Code: {viewingProduct.codigo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge 
                    status={viewingProduct.estado_vencimiento} 
                    daysUntilExpiry={viewingProduct.dias_para_vencer} 
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingProduct(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Information */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">{t('products.productDetails', 'Product Details')}</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('products.code', 'Product Code')}
                          </label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {viewingProduct.codigo}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('products.lotNumber', 'Lot Number')}
                          </label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {viewingProduct.lote}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('products.category', 'Category')}
                          </label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                            {viewingProduct.categoria_nombre || t('products.noCategory', 'No Category')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('settings.tabs.countries.country', 'Country')}
                          </label>
                          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {viewingProduct.country_nombre || t('common.unknown', 'Unknown')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('products.name', 'Product Name')}
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                          {viewingProduct.nombre}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">{t('products.supplierAndResponsibility', 'Supplier & Responsibility')}</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('products.supplier', 'Supplier')}
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {viewingProduct.proveedor || t('products.notSpecified', 'Not specified')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('products.responsiblePerson', 'Responsible Person')}
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                          {viewingProduct.responsable || t('products.notAssigned', 'Not assigned')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Inventory & Dates */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">{t('products.inventoryInformation', 'Inventory Information')}</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('products.currentStock', 'Current Stock')}
                          </label>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-lg font-semibold text-blue-900">
                              {viewingProduct.cantidad?.toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-blue-600">units</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('settings.tabs.import.unitWeight', 'Unit Weight')}
                          </label>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-lg font-semibold text-gray-900">
                              {viewingProduct.peso_unitario || 0}
                            </p>
                            <p className="text-xs text-gray-600">kg</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('settings.tabs.import.totalWeight', 'Total Weight')}
                          </label>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-lg font-semibold text-green-900">
                              {viewingProduct.peso_total || 0}
                            </p>
                            <p className="text-xs text-green-600">kg</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">Important Dates</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('products.registrationDate', 'Registration Date')}
                        </label>
                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {viewingProduct.fecha_registro 
                              ? new Date(viewingProduct.fecha_registro).toLocaleDateString()
                              : t('products.notSpecified', 'Not specified')}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiration Date
                        </label>
                        <div className={`flex items-center space-x-2 p-2 rounded ${
                          viewingProduct.dias_para_vencer < 0 
                            ? 'bg-red-50' 
                            : viewingProduct.dias_para_vencer <= 30 
                            ? 'bg-yellow-50' 
                            : 'bg-green-50'
                        }`}>
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(viewingProduct.fecha_vencimiento).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {viewingProduct.dias_para_vencer !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Days Until Expiration
                          </label>
                          <div className={`p-2 rounded text-center ${
                            viewingProduct.dias_para_vencer < 0 
                              ? 'bg-red-100 text-red-800' 
                              : viewingProduct.dias_para_vencer <= 30 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            <span className="text-lg font-semibold">
                              {viewingProduct.dias_para_vencer < 0 
                                ? `Expired ${Math.abs(viewingProduct.dias_para_vencer)} days ago`
                                : `${viewingProduct.dias_para_vencer} days`}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {viewingProduct.comentarios && (
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {viewingProduct.comentarios}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setViewingProduct(null)}
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setViewingProduct(null);
                    handleEdit(viewingProduct);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;