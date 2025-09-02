import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Plus, Edit, Trash2, Save, X, 
  AlertTriangle, CheckCircle, Tag
} from 'lucide-react';
import categoriesService from '../../services/categoriesService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', is_active: true });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getAll();
      // El backend ya envía el product_count real
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      alert('Error al cargar categorías. Verifique la conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCategory = (category) => {
    const newErrors = {};
    
    if (!category.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (category.name.length > 100) {
      newErrors.name = 'El nombre debe tener máximo 100 caracteres';
    }
    
    // Verificar nombre único
    const existingCategory = categories.find(c => 
      c.name.toLowerCase() === category.name.toLowerCase() && 
      c.id !== (editingCategory?.id || 0)
    );
    if (existingCategory) {
      newErrors.name = 'Este nombre ya existe';
    }

    if (category.description && category.description.length > 500) {
      newErrors.description = 'La descripción debe tener máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCategory(newCategory)) return;

    try {
      const createdCategory = await categoriesService.create(newCategory);
      const categoryWithCount = { ...createdCategory, product_count: 0 };
      setCategories([...categories, categoryWithCount]);
      setNewCategory({ name: '', description: '', is_active: true });
      setIsCreating(false);
      setErrors({});
      alert('Categoría creada exitosamente');
    } catch (error) {
      console.error('Error creando categoría:', error);
      const errorMsg = error.response?.data?.detail || 'Error al crear categoría';
      alert(errorMsg);
    }
  };

  const handleUpdate = async (category) => {
    if (!validateCategory(category)) return;

    try {
      // Solo enviar los campos que se pueden actualizar
      const updateData = {
        name: category.name,
        description: category.description,
        is_active: category.is_active
      };
      
      const updatedCategory = await categoriesService.update(category.id, updateData);
      const categoryWithCount = { ...updatedCategory, product_count: category.product_count };
      const updatedCategories = categories.map(c => 
        c.id === category.id ? categoryWithCount : c
      );
      
      setCategories(updatedCategories);
      setEditingCategory(null);
      setErrors({});
      alert('Categoría actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando categoría:', error);
      const errorMsg = error.response?.data?.detail || 'Error al actualizar categoría';
      alert(errorMsg);
    }
  };

  const handleDelete = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    
    if (category.product_count > 0) {
      alert(`No se puede eliminar la categoría "${category.name}" porque tiene ${category.product_count} producto(s) asociado(s).\n\nPrimero debe reasignar o eliminar los productos.`);
      return;
    }

    if (!window.confirm(`¿Está seguro de que desea eliminar la categoría "${category.name}"?`)) {
      return;
    }

    try {
      await categoriesService.delete(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      alert('Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      const errorMsg = error.response?.data?.detail || 'Error al eliminar categoría';
      alert(errorMsg);
    }
  };

  const toggleActive = async (category) => {
    try {
      const updatedCategory = await categoriesService.toggleActive(category.id);
      const categoryWithCount = { ...updatedCategory, product_count: category.product_count };
      const updatedCategories = categories.map(c => 
        c.id === category.id ? categoryWithCount : c
      );
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error cambiando estado de la categoría:', error);
      alert('Error al cambiar estado de la categoría');
    }
  };

  const startEdit = (category) => {
    setEditingCategory({ ...category });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setErrors({});
  };

  const startCreate = () => {
    setIsCreating(true);
    setNewCategory({ name: '', description: '', is_active: true });
    setErrors({});
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setNewCategory({ name: '', description: '', is_active: true });
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando categorías...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Gestión de Categorías</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Administre las categorías de productos del sistema
          </p>
        </div>
        
        <button
          onClick={startCreate}
          disabled={isCreating}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Crear Nueva Categoría</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Químicos"
                  maxLength={100}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={newCategory.is_active}
                  onChange={(e) => setNewCategory({ ...newCategory, is_active: e.target.value === 'true' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={true}>Activa</option>
                  <option value={false}>Inactiva</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Descripción de la categoría..."
                rows={3}
                maxLength={500}
              />
              {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {newCategory.description.length}/500 caracteres
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCreate}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </button>
              <button
                onClick={cancelCreate}
                className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editingCategory?.id === category.id ? (
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      maxLength={100}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  )}
                  {editingCategory?.id === category.id && errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                  )}
                </td>
                
                <td className="px-6 py-4">
                  {editingCategory?.id === category.id ? (
                    <textarea
                      value={editingCategory.description || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      rows={2}
                      maxLength={500}
                    />
                  ) : (
                    <span className="text-sm text-gray-600 max-w-xs truncate">
                      {category.description || <em className="text-gray-400">Sin descripción</em>}
                    </span>
                  )}
                  {editingCategory?.id === category.id && errors.description && (
                    <p className="text-red-600 text-xs mt-1">{errors.description}</p>
                  )}
                </td>
                
                <td className="px-6 py-4 text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {category.product_count}
                  </span>
                </td>
                
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleActive(category)}
                    disabled={editingCategory?.id === category.id}
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      category.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } ${editingCategory?.id === category.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {category.is_active ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>Activa</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        <span>Inactiva</span>
                      </>
                    )}
                  </button>
                </td>
                
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(category.created_at).toLocaleDateString('es-ES')}
                </td>
                
                <td className="px-6 py-4 text-right text-sm">
                  {editingCategory?.id === category.id ? (
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => handleUpdate(editingCategory)}
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
                        onClick={() => startEdit(category)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`p-1 transition-colors ${
                          category.product_count > 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-700'
                        }`}
                        title={category.product_count > 0 ? 'No se puede eliminar - tiene productos asociados' : 'Eliminar'}
                        disabled={category.product_count > 0}
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

        {categories.length === 0 && (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay categorías configuradas</p>
            <button
              onClick={startCreate}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Crear la primera categoría
            </button>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h4 className="font-medium text-yellow-900 mb-1">Información importante</h4>
            <ul className="text-yellow-800 space-y-1 list-disc list-inside">
              <li>Las categorías inactivas no aparecerán en formularios de creación de productos</li>
              <li>No se puede eliminar una categoría que tenga productos asociados</li>
              <li>Durante la importación de Excel, las categorías que no existan se crearán automáticamente</li>
              <li>El contador de productos se actualiza automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;