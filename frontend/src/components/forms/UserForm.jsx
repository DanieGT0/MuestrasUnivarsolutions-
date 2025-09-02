import React, { useState, useEffect } from 'react';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import userService from '../../services/userService';

const UserForm = ({ user = null, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: '',
    country_ids: [],
    category_id: '', // Mantener para backward compatibility
    category_ids: [], // Múltiples categorías para usuarios comerciales
    is_active: true
  });
  
  const [referenceData, setReferenceData] = useState({
    roles: [],
    countries: [],
    categories: []
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Cargar datos de referencia al montar el componente
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [roles, countries, categories] = await Promise.all([
          userService.getRoles(),
          userService.getCountries(),
          userService.getCategories()
        ]);
        
        setReferenceData({ roles, countries, categories });
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };
    
    loadReferenceData();
  }, []);

  // Cargar datos del usuario si est� editando
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '', // No mostrar contrase�a existente
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role_id: user.role?.id || '',
        country_ids: user.country_ids || [],
        category_id: user.category?.id || '', // Backward compatibility
        category_ids: user.category_ids || [], // Múltiples categorías
        is_active: user.is_active ?? true
      });
      
      // Encontrar el rol seleccionado
      const role = referenceData.roles.find(r => r.id === user.role?.id);
      setSelectedRole(role);
    }
  }, [user, referenceData.roles]);

  // Actualizar rol seleccionado cuando cambia role_id
  useEffect(() => {
    const role = referenceData.roles.find(r => r.id === parseInt(formData.role_id));
    setSelectedRole(role);
    
    // Limpiar categorías si no es comercial
    if (role && role.name !== 'commercial' && role.name !== 'comercial') {
      setFormData(prev => ({ ...prev, category_id: '', category_ids: [] }));
    }
  }, [formData.role_id, referenceData.roles]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCountryChange = (countryId) => {
    setFormData(prev => ({
      ...prev,
      country_ids: prev.country_ids.includes(countryId)
        ? prev.country_ids.filter(id => id !== countryId)
        : [...prev.country_ids, countryId]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inv�lido';
    }
    
    if (!user && !formData.password.trim()) {
      newErrors.password = 'La contrase�a es requerida para usuarios nuevos';
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }
    
    if (!formData.role_id) {
      newErrors.role_id = 'El rol es requerido';
    }
    
    if (!formData.country_ids.length) {
      newErrors.country_ids = 'Al menos un pa�s debe ser asignado';
    }
    
    if (selectedRole && (selectedRole.name === 'commercial' || selectedRole.name === 'comercial') && 
        !formData.category_ids.length && !formData.category_id) {
      newErrors.category_ids = 'Al menos una categoría es requerida para usuarios comerciales';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Preparar datos para env�o
    const submitData = { ...formData };
    
    // Convertir IDs a n�meros
    submitData.role_id = parseInt(submitData.role_id);
    submitData.country_ids = submitData.country_ids.map(id => parseInt(id));
    
    // Manejar categorías múltiples
    if (submitData.category_ids && submitData.category_ids.length > 0) {
      submitData.category_ids = submitData.category_ids.map(id => parseInt(id));
    } else {
      delete submitData.category_ids;
    }
    
    // Mantener backward compatibility con category_id
    if (submitData.category_id) {
      submitData.category_id = parseInt(submitData.category_id);
    } else {
      delete submitData.category_id;
    }
    
    // Si es edici�n y no hay contrase�a, no enviarla
    if (user && !submitData.password.trim()) {
      delete submitData.password;
    }
    
    onSubmit(submitData);
  };

  const isCommercialRole = selectedRole && (selectedRole.name === 'commercial' || selectedRole.name === 'comercial');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informaci�n b�sica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contrase�a {!user && '*'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              placeholder={user ? "Dejar vac�o para no cambiar" : ""}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
            Apellido *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
        </div>
      </div>

      {/* Rol y estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-2">
            Rol *
          </label>
          <select
            id="role_id"
            name="role_id"
            value={formData.role_id}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.role_id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Seleccionar rol</option>
            {referenceData.roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name} {role.description && `- ${role.description}`}
              </option>
            ))}
          </select>
          {errors.role_id && <p className="text-red-500 text-sm mt-1">{errors.role_id}</p>}
        </div>

        <div className="flex items-center">
          <label htmlFor="is_active" className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="mr-2"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700">Usuario activo</span>
          </label>
        </div>
      </div>

      {/* Categorías para usuarios comerciales */}
      {isCommercialRole && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorías Asignadas *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg">
            {referenceData.categories.map(category => (
              <label key={category.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.category_ids.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm" title={category.description}>
                  {category.name}
                </span>
              </label>
            ))}
          </div>
          {errors.category_ids && <p className="text-red-500 text-sm mt-1">{errors.category_ids}</p>}
        </div>
      )}

      {/* Pa�ses asignados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pa�ses Asignados *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg">
          {referenceData.countries.map(country => (
            <label key={country.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.country_ids.includes(country.id)}
                onChange={() => handleCountryChange(country.id)}
                className="mr-2"
                disabled={isLoading}
              />
              <span className="text-sm">{country.name} ({country.code})</span>
            </label>
          ))}
        </div>
        {errors.country_ids && <p className="text-red-500 text-sm mt-1">{errors.country_ids}</p>}
      </div>

      {/* Botones de acci�n */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
};

export default UserForm;