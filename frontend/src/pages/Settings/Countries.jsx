import React, { useState, useEffect } from 'react';
import { 
  Globe, Plus, Edit, Trash2, Save, X, 
  AlertTriangle, CheckCircle, Flag
} from 'lucide-react';
import countriesService from '../../services/countriesService';
import { useTranslation } from '../../hooks/useTranslation';

const Countries = () => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCountry, setEditingCountry] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCountry, setNewCountry] = useState({ name: '', code: '', is_active: true });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setIsLoading(true);
      const data = await countriesService.getAll();
      setCountries(data);
    } catch (error) {
      console.error('Error cargando países:', error);
      alert('Error al cargar países. Verifique la conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCountry = (country) => {
    const newErrors = {};
    
    if (!country.name.trim()) {
      newErrors.name = t('settings.tabs.countries.nameRequired');
    }
    
    if (!country.code.trim()) {
      newErrors.code = t('settings.tabs.countries.codeRequired');
    } else if (country.code.length > 5) {
      newErrors.code = t('settings.tabs.countries.codeMaxLength');
    }
    
    // Verificar c�digo �nico
    const existingCountry = countries.find(c => 
      c.code.toUpperCase() === country.code.toUpperCase() && 
      c.id !== (editingCountry?.id || 0)
    );
    if (existingCountry) {
      newErrors.code = t('settings.tabs.countries.codeExists');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCountry(newCountry)) return;

    try {
      const createdCountry = await countriesService.create(newCountry);
      setCountries([...countries, createdCountry]);
      setNewCountry({ name: '', code: '', is_active: true });
      setIsCreating(false);
      setErrors({});
      alert(t('settings.tabs.countries.createdSuccess'));
    } catch (error) {
      console.error('Error creando país:', error);
      const errorMsg = error.response?.data?.detail || t('settings.tabs.countries.createError');
      alert(errorMsg);
    }
  };

  const handleUpdate = async (country) => {
    if (!validateCountry(country)) return;

    try {
      const updatedCountry = await countriesService.update(country.id, country);
      const updatedCountries = countries.map(c => 
        c.id === country.id ? updatedCountry : c
      );
      
      setCountries(updatedCountries);
      setEditingCountry(null);
      setErrors({});
      alert(t('settings.tabs.countries.updatedSuccess'));
    } catch (error) {
      console.error('Error actualizando país:', error);
      const errorMsg = error.response?.data?.detail || t('settings.tabs.countries.updateError');
      alert(errorMsg);
    }
  };

  const handleDelete = async (countryId) => {
    if (!window.confirm(t('settings.tabs.countries.deleteConfirm'))) {
      return;
    }

    try {
      await countriesService.delete(countryId);
      setCountries(countries.filter(c => c.id !== countryId));
      alert(t('settings.tabs.countries.deletedSuccess'));
    } catch (error) {
      console.error('Error eliminando país:', error);
      const errorMsg = error.response?.data?.detail || t('settings.tabs.countries.deleteError');
      alert(errorMsg);
    }
  };

  const toggleActive = async (country) => {
    try {
      const updatedCountry = await countriesService.toggleActive(country.id);
      const updatedCountries = countries.map(c => 
        c.id === country.id ? updatedCountry : c
      );
      setCountries(updatedCountries);
    } catch (error) {
      console.error('Error cambiando estado del país:', error);
      alert(t('settings.tabs.countries.toggleError'));
    }
  };

  const startEdit = (country) => {
    setEditingCountry({ ...country });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingCountry(null);
    setErrors({});
  };

  const startCreate = () => {
    setIsCreating(true);
    setNewCountry({ name: '', code: '', is_active: true });
    setErrors({});
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setNewCountry({ name: '', code: '', is_active: true });
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('settings.tabs.countries.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con bot�n crear */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>{t('settings.tabs.countries.title')}</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('settings.tabs.countries.description')}
          </p>
        </div>
        
        <button
          onClick={startCreate}
          disabled={isCreating}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{t('settings.tabs.countries.new')}</span>
        </button>
      </div>

      {/* Formulario de creaci�n */}
      {isCreating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">{t('settings.tabs.countries.createTitle')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.tabs.countries.nameLabel')} *
              </label>
              <input
                type="text"
                value={newCountry.name}
                onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Guatemala"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.tabs.countries.codeLabel')} *
              </label>
              <input
                type="text"
                value={newCountry.code}
                onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.code ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: GT"
                maxLength={5}
              />
              {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code}</p>}
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={handleCreate}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{t('common.save')}</span>
              </button>
              <button
                onClick={cancelCreate}
                className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>{t('common.cancel')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de pa�ses */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('settings.tabs.countries.country')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('settings.tabs.countries.code')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.status', 'Estado')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('settings.tabs.countries.created')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('settings.tabs.countries.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {countries.map((country) => (
              <tr key={country.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editingCountry?.id === country.id ? (
                    <input
                      type="text"
                      value={editingCountry.name}
                      onChange={(e) => setEditingCountry({ ...editingCountry, name: e.target.value })}
                      className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Flag className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-900">{country.name}</span>
                    </div>
                  )}
                  {editingCountry?.id === country.id && errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  {editingCountry?.id === country.id ? (
                    <input
                      type="text"
                      value={editingCountry.code}
                      onChange={(e) => setEditingCountry({ ...editingCountry, code: e.target.value.toUpperCase() })}
                      className={`w-20 border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.code ? 'border-red-300' : 'border-gray-300'
                      }`}
                      maxLength={5}
                    />
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
                      {country.code}
                    </span>
                  )}
                  {editingCountry?.id === country.id && errors.code && (
                    <p className="text-red-600 text-xs mt-1">{errors.code}</p>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(country)}
                    disabled={editingCountry?.id === country.id}
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      country.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } ${editingCountry?.id === country.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {country.is_active ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>{t('common.active')}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        <span>{t('common.inactive')}</span>
                      </>
                    )}
                  </button>
                </td>
                
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(country.created_at).toLocaleDateString('es-ES')}
                </td>
                
                <td className="px-6 py-4 text-right text-sm">
                  {editingCountry?.id === country.id ? (
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => handleUpdate(editingCountry)}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Guardar cambios"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 hover:text-gray-700 p-1"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => startEdit(country)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(country.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {countries.length === 0 && (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('settings.tabs.countries.noCountries')}</p>
            <button
              onClick={startCreate}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              {t('settings.tabs.countries.createFirst')}
            </button>
          </div>
        )}
      </div>

      {/* Informaci�n adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h4 className="font-medium text-yellow-900 mb-1">{t('settings.tabs.countries.importantInfo')}</h4>
            <ul className="text-yellow-800 space-y-1 list-disc list-inside">
              <li>{t('settings.tabs.countries.inactiveInfo')}</li>
              <li>{t('settings.tabs.countries.deleteInfo')}</li>
              <li>{t('settings.tabs.countries.codeInfo')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countries;