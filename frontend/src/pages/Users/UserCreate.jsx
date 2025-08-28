import React, { useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import UserForm from '../../components/forms/UserForm';
import userService from '../../services/userService';

const UserCreate = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (userData) => {
    try {
      setIsLoading(true);
      await userService.createUser(userData);
      
      // Mostrar mensaje de �xito
      alert('Usuario creado exitosamente');
      
      // Volver a la lista de usuarios
      onBack();
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Mostrar mensaje de error espec�fico
      let errorMessage = 'Error al crear usuario';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('�Est� seguro de cancelar? Los cambios no guardados se perder�n.')) {
      onBack();
    }
  };

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
              <UserPlus className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h1>
                <p className="text-gray-600">Complete la informaci�n para crear un nuevo usuario</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <UserForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>

      {/* Informaci�n adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Informaci�n Importante</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>" Los usuarios deben tener al menos un pa�s asignado</li>
          <li>" Los usuarios con rol "comercial" deben tener una categor�a de producto asignada</li>
          <li>" El email debe ser �nico en el sistema</li>
          <li>" La contrase�a debe ser segura y ser� encriptada</li>
          <li>" Los usuarios pueden ser asignados a m�ltiples pa�ses</li>
        </ul>
      </div>
    </div>
  );
};

export default UserCreate;