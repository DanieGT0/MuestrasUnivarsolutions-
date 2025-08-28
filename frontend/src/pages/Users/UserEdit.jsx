import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCog } from 'lucide-react';
import UserForm from '../../components/forms/UserForm';
import userService from '../../services/userService';

const UserEdit = ({ userId, onBack }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        alert('Error al cargar los datos del usuario');
        onBack();
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId, onBack]);

  const handleSubmit = async (userData) => {
    try {
      setIsSubmitting(true);
      await userService.updateUser(userId, userData);
      
      // Mostrar mensaje de �xito
      alert('Usuario actualizado exitosamente');
      
      // Volver a la lista de usuarios
      onBack();
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Mostrar mensaje de error espec�fico
      let errorMessage = 'Error al actualizar usuario';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('�Est� seguro de cancelar? Los cambios no guardados se perder�n.')) {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Usuario no encontrado</p>
          <button
            onClick={onBack}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              <UserCog className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
                <p className="text-gray-600">Modificar informaci�n de {user.full_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informaci�n del usuario actual */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Rol actual:</span>
            <p className="text-gray-900">{user.role?.name || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Estado:</span>
            <p className={user.is_active ? 'text-green-600' : 'text-red-600'}>
              {user.is_active ? 'Activo' : 'Inactivo'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <UserForm
          user={user}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>

      {/* Informaci�n adicional */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Notas de Edici�n</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>" Deje el campo de contrase�a vac�o si no desea cambiarla</li>
          <li>" Al cambiar el rol de un usuario, verifique que tenga los permisos correctos</li>
          <li>" Los usuarios comerciales deben tener una categor�a asignada</li>
          <li>" Los cambios en pa�ses asignados afectar�n el acceso a productos</li>
          <li>" Desactivar un usuario impedir� su acceso al sistema</li>
        </ul>
      </div>
    </div>
  );
};

export default UserEdit;