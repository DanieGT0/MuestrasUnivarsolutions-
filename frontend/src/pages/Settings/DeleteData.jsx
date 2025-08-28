import React, { useState, useEffect } from 'react';
import { 
  Trash2, AlertTriangle, Globe, Eye, Lock, 
  Database, Package, TrendingDown, Shield
} from 'lucide-react';
import { countriesService } from '../../services/countriesService';
import { statisticsService } from '../../services/statisticsService';
import { useTranslation } from '../../hooks/useTranslation';

const DeleteData = () => {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteMode, setDeleteMode] = useState('products'); // 'products' | 'movements' | 'all'
  const [includeMovements, setIncludeMovements] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countries, setCountries] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Cargar países al montar el componente
  useEffect(() => {
    loadCountries();
  }, []);

  // Cargar estadísticas cuando se selecciona un país
  useEffect(() => {
    if (selectedCountry) {
      loadStatistics();
    } else {
      setStatistics(null);
    }
  }, [selectedCountry]);

  const loadCountries = async () => {
    try {
      const response = await countriesService.getAll();
      setCountries(response || []);
    } catch (error) {
      console.error('Error cargando países:', error);
      setCountries([]);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await statisticsService.getCountryStatistics(selectedCountry);
      setStatistics({
        products: response.products,
        movements: response.movements,
        categories: response.categories,
        lastActivity: response.last_activity ? new Date(response.last_activity) : null
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setStatistics(null);
    }
  };

  const validatePassword = () => {
    // Por defecto "univar", en producción esto vendría de la configuración del sistema
    const systemPassword = 'univar'; 
    return password === systemPassword;
  };

  const handleDeleteConfirmation = () => {
    if (!selectedCountry) {
      alert(t('settings.tabs.delete.selectCountry'));
      return;
    }

    if (!password) {
      alert(t('settings.tabs.delete.enterPassword'));
      return;
    }

    if (!validatePassword()) {
      alert(t('settings.tabs.delete.incorrectPassword'));
      return;
    }

    if (password !== confirmPassword) {
      alert(t('settings.tabs.delete.passwordMismatch'));
      return;
    }

    setShowConfirmation(true);
  };

  const executeDelete = async () => {
    try {
      setIsDeleting(true);
      
      const countryName = countries.find(c => c.code === selectedCountry)?.name;
      let result;
      
      // Ejecutar eliminación según el modo seleccionado
      if (deleteMode === 'products') {
        result = await statisticsService.deleteCountryProducts(selectedCountry, includeMovements);
      } else if (deleteMode === 'movements') {
        result = await statisticsService.deleteCountryMovements(selectedCountry);
      } else if (deleteMode === 'all') {
        result = await statisticsService.deleteAllCountryData(selectedCountry);
      }

      // Mostrar resultado
      let deletedItems = [];
      if (result.deleted_products > 0) {
        deletedItems.push(`${result.deleted_products} productos`);
      }
      if (result.deleted_movements > 0) {
        deletedItems.push(`${result.deleted_movements} movimientos`);
      }

      alert(`${result.message}:\n- ${deletedItems.join('\n- ')}`);
      
      // Limpiar formulario
      setSelectedCountry('');
      setPassword('');
      setConfirmPassword('');
      setShowConfirmation(false);
      setStatistics(null);
      
    } catch (error) {
      console.error('Error durante eliminación:', error);
      alert(t('settings.tabs.delete.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeleteDescription = () => {
    const items = [];
    if (deleteMode === 'products' || deleteMode === 'all') {
      items.push('productos');
    }
    if (deleteMode === 'movements' || deleteMode === 'all') {
      items.push('movimientos');
    }
    return items.join(' y ');
  };

  return (
    <div className="space-y-6">
      {/* Advertencia de seguridad */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">
              {t('settings.tabs.delete.dangerZone')}
            </h3>
            <p className="text-red-800 text-sm mb-2">
              {t('settings.tabs.delete.warningMessage')}
            </p>
            <ul className="text-red-700 text-xs list-disc list-inside space-y-1">
              <li>Asegúrese de tener backups actualizados antes de proceder</li>
              <li>Verifique dos veces el país seleccionado</li>
              <li>Esta acción requiere contraseña de administrador</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario de eliminación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de eliminación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>{t('settings.tabs.delete.configTitle')}</span>
          </h3>

          {/* Selección de país */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.tabs.delete.countryToDelete')} *
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isDeleting}
            >
              <option value="">{t('settings.tabs.delete.selectCountryOption')}</option>
              {countries.map(country => (
                <option key={country.id} value={country.code}>
                  {country.code} - {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de eliminación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.tabs.delete.dataTypeLabel')}
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deleteMode"
                  value="products"
                  checked={deleteMode === 'products'}
                  onChange={(e) => setDeleteMode(e.target.value)}
                  className="mr-2 text-red-600 focus:ring-red-500"
                  disabled={isDeleting}
                />
                <span className="text-sm">{t('settings.tabs.delete.onlyProducts')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deleteMode"
                  value="movements"
                  checked={deleteMode === 'movements'}
                  onChange={(e) => setDeleteMode(e.target.value)}
                  className="mr-2 text-red-600 focus:ring-red-500"
                  disabled={isDeleting}
                />
                <span className="text-sm">{t('settings.tabs.delete.onlyMovements')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deleteMode"
                  value="all"
                  checked={deleteMode === 'all'}
                  onChange={(e) => setDeleteMode(e.target.value)}
                  className="mr-2 text-red-600 focus:ring-red-500"
                  disabled={isDeleting}
                />
                <span className="text-sm">{t('settings.tabs.delete.productsAndMovements')}</span>
              </label>
            </div>
          </div>

          {/* Opción de incluir movimientos (solo si deleteMode es 'products') */}
          {deleteMode === 'products' && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeMovements}
                  onChange={(e) => setIncludeMovements(e.target.checked)}
                  className="mr-2 text-red-600 focus:ring-red-500 rounded"
                  disabled={isDeleting}
                />
                <span className="text-sm">
                  Incluir movimientos asociados a los productos
                </span>
              </label>
            </div>
          )}

          {/* Contraseñas */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.tabs.delete.adminPasswordLabel')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese la contraseña"
                  className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isDeleting}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.tabs.delete.confirmPasswordLabel')} *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme la contraseña"
                  className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  disabled={isDeleting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vista previa de eliminación */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>{t('settings.tabs.delete.previewTitle')}</span>
          </h3>

          {selectedCountry && statistics ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">País seleccionado:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {countries.find(c => c.code === selectedCountry)?.name}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">Productos</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {statistics.products.toLocaleString()}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingDown className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-600">Movimientos</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {statistics.movements.toLocaleString()}
                  </div>
                </div>
              </div>

              {statistics.lastActivity && (
                <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
                  Última actividad: {statistics.lastActivity.toLocaleDateString('es-ES')}
                </div>
              )}

              {/* Resumen de lo que se eliminará */}
              <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                <div className="text-sm font-medium text-red-900 mb-1">
                  Se eliminarán:
                </div>
                <ul className="text-sm text-red-800 list-disc list-inside">
                  {(deleteMode === 'products' || deleteMode === 'all') && (
                    <li>{statistics.products.toLocaleString()} productos</li>
                  )}
                  {((includeMovements && deleteMode === 'products') || deleteMode === 'movements' || deleteMode === 'all') && (
                    <li>{statistics.movements.toLocaleString()} movimientos</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Seleccione un país para ver las estadísticas de eliminación
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center pt-6 border-t border-gray-200">
        {!showConfirmation ? (
          <button
            onClick={handleDeleteConfirmation}
            disabled={!selectedCountry || !password || !confirmPassword || isDeleting}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>{t('settings.tabs.delete.deleteData')}</span>
          </button>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">
                {t('settings.tabs.delete.finalConfirmation')}
              </h4>
              <p className="text-yellow-800 text-sm mb-3">
                ¿Está absolutamente seguro de que desea eliminar todos los {getDeleteDescription()} 
                del país {countries.find(c => c.code === selectedCountry)?.name}?
              </p>
              <p className="text-yellow-700 text-xs">
                Esta acción es IRREVERSIBLE y eliminará permanentemente los datos seleccionados.
              </p>
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isDeleting}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-spin' : ''}`} />
                <span>
                  {isDeleting ? 'Eliminando...' : 'SÍ, ELIMINAR DEFINITIVAMENTE'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteData;