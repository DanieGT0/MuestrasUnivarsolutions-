import React, { useState, useEffect, useContext } from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import userService from '../../services/userService';
import productService from '../../services/productService';
import { UserContext } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';

const ProductForm = ({ product = null, onSubmit, onCancel, isLoading = false }) => {
  const { user } = useContext(UserContext);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    lote: '',
    cantidad: '',
    peso_unitario: '',
    peso_total: '',
    fecha_vencimiento: '',
    proveedor: '',
    responsable: '',
    comentarios: '',
    categoria_id: '',
    country_id: ''
  });
  
  const [referenceData, setReferenceData] = useState({
    categories: [],
    countries: []
  });
  
  const [errors, setErrors] = useState({});
  const [userCountries, setUserCountries] = useState([]);
  const [showCountrySelection, setShowCountrySelection] = useState(false);

  // Debug log for showCountrySelection changes
  useEffect(() => {
    console.log('=== showCountrySelection STATE CHANGE ===');
    console.log('showCountrySelection changed to:', showCountrySelection);
    console.log('userCountries length:', userCountries.length);
    console.log('Current user role:', user?.role);
  }, [showCountrySelection]);

  // Cargar datos de referencia al montar el componente
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        console.log('=== ProductForm Debug ===');
        console.log('User object:', user);
        console.log('User role name:', user?.role?.name);
        console.log('User role direct:', user?.role);
        console.log('Is admin (role.name)?', user?.role?.name === 'admin');
        console.log('Is admin (role direct)?', user?.role === 'admin');
        console.log('Loading reference data...');
        
        const [categories, availableCountries] = await Promise.all([
          userService.getCategories(),
          productService.getAvailableCountries()
        ]);
        
        console.log('Categories:', categories);
        console.log('Available countries:', availableCountries);
        console.log('Available countries length:', availableCountries.length);
        
        setReferenceData({ categories, countries: availableCountries });
        setUserCountries(availableCountries);
        
        // Mostrar selección de país si es admin o si hay más de una opción
        const isAdmin = user?.role === 'admin' || user?.role?.name === 'admin';
        const shouldShowCountrySelection = isAdmin || availableCountries.length > 1;
        console.log('=== DECISION LOGIC ===');
        console.log('Is admin:', isAdmin);
        console.log('Available countries length:', availableCountries.length);
        console.log('Formula: isAdmin || availableCountries.length > 1');
        console.log('Result:', shouldShowCountrySelection);
        console.log('About to set showCountrySelection to:', shouldShowCountrySelection);
        setShowCountrySelection(shouldShowCountrySelection);
        
        // Si solo tiene un país y no es admin, seleccionarlo automáticamente
        if (availableCountries.length === 1 && !(user?.role === 'admin' || user?.role?.name === 'admin')) {
          setFormData(prev => ({ ...prev, country_id: availableCountries[0].id }));
          console.log('Auto-selected country:', availableCountries[0]);
        }
      } catch (error) {
        console.error('Error loading reference data:', error);
        
        // Fallback: usar el método anterior si falla el nuevo endpoint
        try {
          console.log('=== FALLBACK METHOD ===');
          console.log('Trying fallback method...');
          const [categories, allCountries] = await Promise.all([
            userService.getCategories(),
            userService.getCountries()
          ]);
          
          console.log('All countries from fallback:', allCountries);
          
          // Filtrar países según el usuario actual
          let availableCountries = [];
          if (user) {
            console.log('User in fallback:', user);
            console.log('User object keys:', Object.keys(user));
            console.log('User role:', user.role);
            if (user.role) {
              console.log('User role keys:', Object.keys(user.role));
              console.log('User role name:', user.role.name);
            }
            console.log('User.role?.name === "admin":', user.role?.name === 'admin');
            console.log('User.role === "admin":', user.role === 'admin');
            console.log('User assigned_countries:', user.assigned_countries);
            console.log('User country_ids:', user.country_ids);
            console.log('User country_id:', user.country_id);
            
            if (user.role === 'admin' || user.role?.name === 'admin') {
              console.log('User is admin - using all countries');
              availableCountries = allCountries;
            } else if (user.assigned_countries && user.assigned_countries.length > 0) {
              console.log('User has assigned_countries:', user.assigned_countries);
              // Convert country names to country objects
              availableCountries = allCountries.filter(country => 
                user.assigned_countries.includes(country.name)
              );
            } else if (user.country_ids && user.country_ids.length > 0) {
              console.log('User has country_ids:', user.country_ids);
              availableCountries = allCountries.filter(country => 
                user.country_ids.includes(country.id)
              );
            }
          }
          
          console.log('Fallback available countries:', availableCountries);
          console.log('Fallback available countries length:', availableCountries.length);
          setReferenceData({ categories, countries: availableCountries });
          setUserCountries(availableCountries);
          
          const isAdmin = user?.role === 'admin' || user?.role?.name === 'admin';
          const shouldShowCountrySelection = isAdmin || availableCountries.length > 1;
          console.log('=== FALLBACK DECISION LOGIC ===');
          console.log('Fallback - Is admin:', isAdmin);
          console.log('Fallback - Available countries length:', availableCountries.length);
          console.log('Fallback - Formula: isAdmin || availableCountries.length > 1');
          console.log('Fallback - Result:', shouldShowCountrySelection);
          console.log('Fallback - About to set showCountrySelection to:', shouldShowCountrySelection);
          setShowCountrySelection(shouldShowCountrySelection);
          
          if (availableCountries.length === 1 && !(user?.role === 'admin' || user?.role?.name === 'admin')) {
            setFormData(prev => ({ ...prev, country_id: availableCountries[0].id }));
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    };
    
    loadReferenceData();
    
    // Log final state after a timeout to see what actually got set
    setTimeout(() => {
      console.log('=== FINAL STATE ===');
      console.log('showCountrySelection final state:', showCountrySelection);
      console.log('userCountries final state:', userCountries);
    }, 100);
  }, [user]);

  // Cargar datos del producto si esta editando
  useEffect(() => {
    if (product) {
      console.log('Loading product data:', product);
      console.log('Product estructura:', {
        categoria_id: product.categoria_id,
        categoria: product.categoria,
        country_id: product.country_id,
        country: product.country,
        proveedor: product.proveedor,
        responsable: product.responsable,
        comentarios: product.comentarios
      });
      setFormData({
        codigo: product.codigo || '',
        nombre: product.nombre || '',
        lote: product.lote || '',
        cantidad: product.cantidad || '',
        peso_unitario: product.peso_unitario || '',
        peso_total: product.peso_total || '',
        fecha_vencimiento: product.fecha_vencimiento || '',
        proveedor: product.proveedor || '',
        responsable: product.responsable || '',
        comentarios: product.comentarios || '',
        categoria_id: product.categoria_id || product.categoria?.id || '',
        country_id: product.country_id || product.country?.id || ''
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Calcular peso total automaticamente
    if (name === 'cantidad' || name === 'peso_unitario') {
      const cantidad = name === 'cantidad' ? newValue : formData.cantidad;
      const pesoUnitario = name === 'peso_unitario' ? newValue : formData.peso_unitario;
      
      if (cantidad && pesoUnitario) {
        const pesoTotal = (parseFloat(cantidad) * parseFloat(pesoUnitario)).toFixed(2);
        setFormData(prev => ({ ...prev, peso_total: pesoTotal }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // El código se genera automáticamente, no es necesario validarlo para nuevos productos
    if (product && !formData.codigo.trim()) {
      newErrors.codigo = t('products.validation.codeRequired', 'El codigo es requerido');
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = t('products.validation.nameRequired', 'El nombre es requerido');
    }
    
    if (!formData.lote.trim()) {
      newErrors.lote = t('products.validation.lotRequired', 'El lote es requerido');
    }
    
    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = t('products.validation.quantityGreaterThanZero', 'La cantidad debe ser mayor a 0');
    }
    
    if (!formData.peso_unitario || formData.peso_unitario <= 0) {
      newErrors.peso_unitario = t('products.validation.unitWeightGreaterThanZero', 'El peso unitario debe ser mayor a 0');
    }
    
    if (!formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = t('products.validation.expirationDateRequired', 'La fecha de vencimiento es requerida');
    }
    
    if (!formData.proveedor.trim()) {
      newErrors.proveedor = t('products.validation.supplierRequired', 'El proveedor es requerido');
    }
    
    if (!formData.responsable.trim()) {
      newErrors.responsable = t('products.validation.responsibleRequired', 'El responsable es requerido');
    }
    
    if (!formData.categoria_id) {
      newErrors.categoria_id = t('products.validation.categoryRequired', 'La categoria es requerida');
    }
    
    if (showCountrySelection && !formData.country_id) {
      newErrors.country_id = t('products.validation.countryRequired', 'Debe seleccionar un pais');
    } else if (!showCountrySelection && userCountries.length === 0) {
      newErrors.country_id = t('products.validation.noCountriesAssigned', 'No tiene paises asignados. Contacte al administrador.');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Preparar datos para envio
    const submitData = { ...formData };
    
    // Convertir IDs a numeros
    submitData.categoria_id = parseInt(submitData.categoria_id);
    submitData.country_id = parseInt(submitData.country_id);
    submitData.cantidad = parseInt(submitData.cantidad);
    submitData.peso_unitario = parseFloat(submitData.peso_unitario);
    submitData.peso_total = parseFloat(submitData.peso_total);
    
    // Fix date timezone issue - ensure date is interpreted in local timezone
    if (submitData.fecha_vencimiento) {
      // Create a date object explicitly in local timezone
      const dateOnly = submitData.fecha_vencimiento;
      console.log('Original fecha_vencimiento from form:', dateOnly);
      
      // Ensure the date format is YYYY-MM-DD for consistent backend handling
      if (dateOnly.includes('-') && dateOnly.split('-').length === 3) {
        submitData.fecha_vencimiento = dateOnly;
        console.log('Processed fecha_vencimiento for backend:', submitData.fecha_vencimiento);
      }
    }
    
    // Remover codigo si es un producto nuevo (se genera automaticamente)
    if (!product) {
      delete submitData.codigo;
    }
    
    console.log('Final submit data:', submitData);
    onSubmit(submitData);
  };

  // Filtrar categorias si el usuario es comercial
  const getAvailableCategories = () => {
    if (!user) return referenceData.categories;
    
    // Si es comercial, solo mostrar su categoria asignada
    if ((user.role === 'commercial' || user.role?.name === 'commercial') && user.category) {
      return referenceData.categories.filter(cat => cat.id === user.category.id);
    }
    
    return referenceData.categories;
  };

  const availableCategories = getAvailableCategories();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alerta para usuarios con multiples paises */}
      {showCountrySelection && userCountries.length > 1 && (
        <div className="border rounded-lg p-4" style={{ backgroundColor: 'var(--color-info)', borderColor: 'var(--color-info)', opacity: 0.1 }}>
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mt-0.5 mr-2" style={{ color: 'var(--color-info)' }} />
            <div>
              <h3 className="text-sm font-medium theme-text-primary">Seleccion de Pais</h3>
              <p className="text-sm theme-text-secondary mt-1">
                Tienes asignados multiples paises. Selecciona en cual deseas registrar este producto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seleccion de pais (solo si aplica) */}
      {showCountrySelection && (
        <div>
          <label htmlFor="country_id" className="block text-sm font-medium theme-text-primary mb-2">
            Pais de Registro *
          </label>
          <select
            id="country_id"
            name="country_id"
            value={formData.country_id}
            onChange={handleInputChange}
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.country_id ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          >
            <option value="">Seleccionar pais</option>
            {userCountries.map(country => (
              <option key={country.id} value={country.id}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
          {errors.country_id && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.country_id}</p>}
        </div>
      )}

      {/* Informacion basica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium theme-text-primary mb-2">
            Codigo del Producto {product && '*'}
          </label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            value={formData.codigo}
            onChange={handleInputChange}
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.codigo ? 'border-red-500' : ''
            } ${!product ? 'theme-bg-secondary' : ''}`}
            disabled={isLoading || !product}
            placeholder={!product ? "Se generara automaticamente" : "Ej: GT100825001"}
            readOnly={!product}
          />
          {!product && <p className="text-xs theme-text-tertiary mt-1">El codigo se generara automaticamente basado en el pais seleccionado</p>}
          {errors.codigo && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.codigo}</p>}
        </div>

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium theme-text-primary mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.nombre ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.nombre && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.nombre}</p>}
        </div>

        <div>
          <label htmlFor="lote" className="block text-sm font-medium theme-text-primary mb-2">
            Lote *
          </label>
          <input
            type="text"
            id="lote"
            name="lote"
            value={formData.lote}
            onChange={handleInputChange}
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.lote ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.lote && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.lote}</p>}
        </div>

        <div>
          <label htmlFor="categoria_id" className="block text-sm font-medium theme-text-primary mb-2">
            Categoria *
          </label>
          <select
            id="categoria_id"
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleInputChange}
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.categoria_id ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          >
            <option value="">Seleccionar categoria</option>
            {availableCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoria_id && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.categoria_id}</p>}
        </div>
      </div>

      {/* Cantidades y pesos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="cantidad" className="block text-sm font-medium theme-text-primary mb-2">
            Cantidad *
          </label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleInputChange}
            min="1"
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.cantidad ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.cantidad && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.cantidad}</p>}
        </div>

        <div>
          <label htmlFor="peso_unitario" className="block text-sm font-medium theme-text-primary mb-2">
            Peso Unitario (Kg) *
          </label>
          <input
            type="number"
            id="peso_unitario"
            name="peso_unitario"
            value={formData.peso_unitario}
            onChange={handleInputChange}
            step="0.01"
            min="0.01"
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.peso_unitario ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.peso_unitario && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.peso_unitario}</p>}
        </div>

        <div>
          <label htmlFor="peso_total" className="block text-sm font-medium theme-text-primary mb-2">
            Peso Total (Kg)
          </label>
          <input
            type="number"
            id="peso_total"
            name="peso_total"
            value={formData.peso_total}
            onChange={handleInputChange}
            step="0.01"
            className="theme-input w-full px-3 py-2 border rounded-lg theme-bg-secondary focus:outline-none"
            disabled={true}
          />
          <p className="text-xs theme-text-tertiary mt-1">Se calcula automaticamente</p>
        </div>
      </div>

      {/* Fechas e informacion adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fecha_vencimiento" className="block text-sm font-medium theme-text-primary mb-2">
            Fecha de Vencimiento *
          </label>
          <input
            type="date"
            id="fecha_vencimiento"
            name="fecha_vencimiento"
            value={formData.fecha_vencimiento}
            onChange={handleInputChange}
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.fecha_vencimiento ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.fecha_vencimiento && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.fecha_vencimiento}</p>}
        </div>

        <div>
          <label htmlFor="proveedor" className="block text-sm font-medium theme-text-primary mb-2">
            Proveedor *
          </label>
          <input
            type="text"
            id="proveedor"
            name="proveedor"
            value={formData.proveedor}
            onChange={handleInputChange}
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.proveedor ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.proveedor && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.proveedor}</p>}
        </div>

        <div>
          <label htmlFor="responsable" className="block text-sm font-medium theme-text-primary mb-2">
            Responsable *
          </label>
          <input
            type="text"
            id="responsable"
            name="responsable"
            value={formData.responsable}
            onChange={handleInputChange}
            className={`theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.responsable ? 'border-red-500' : ''
            }`}
            disabled={isLoading}
          />
          {errors.responsable && <p className="badge-danger text-sm mt-1 px-2 py-1 rounded">{errors.responsable}</p>}
        </div>
      </div>

      {/* Comentarios */}
      <div>
        <label htmlFor="comentarios" className="block text-sm font-medium theme-text-primary mb-2">
          Comentarios
        </label>
        <textarea
          id="comentarios"
          name="comentarios"
          value={formData.comentarios}
          onChange={handleInputChange}
          rows="3"
          className="theme-input w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
          disabled={isLoading}
          placeholder="Informacion adicional sobre el producto..."
        />
      </div>

      {/* Botones de accion */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 theme-text-secondary theme-bg-secondary rounded-lg hover:theme-bg-tertiary disabled:opacity-50 flex items-center transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          {t('common.cancel', 'Cancelar')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-theme-primary px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? t('common.saving', 'Guardando...') : (product ? t('common.update', 'Actualizar') : t('common.create', 'Crear'))}
        </button>
      </div>
      </form>
    </div>
  );
};

export default ProductForm;