import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Save, Eye, EyeOff, 
  CheckCircle, AlertTriangle, Key
} from 'lucide-react';

const SystemConfig = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      // Simular carga de información del sistema - reemplazar con API real
      setSystemInfo({
        version: '1.0.0',
        environment: 'development',
        lastPasswordChange: '2024-08-01',
        passwordComplexity: 'medium'
      });
    } catch (error) {
      console.error('Error cargando información del sistema:', error);
    }
  };

  const validatePasswordChange = () => {
    // Contraseña actual por defecto es "univar"
    const systemPassword = 'univar';
    
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Por favor, ingrese la contraseña actual' });
      return false;
    }

    if (currentPassword !== systemPassword) {
      setMessage({ type: 'error', text: 'La contraseña actual es incorrecta' });
      return false;
    }

    if (!newPassword) {
      setMessage({ type: 'error', text: 'Por favor, ingrese la nueva contraseña' });
      return false;
    }

    if (newPassword.length < 5) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 5 caracteres' });
      return false;
    }

    if (newPassword === currentPassword) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe ser diferente a la actual' });
      return false;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'La confirmación de contraseña no coincide' });
      return false;
    }

    return true;
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordChange()) return;

    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });

      // Simular cambio de contraseña - reemplazar con API real
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Aquí iría la llamada real a la API
      console.log('Cambiando contraseña del sistema...');
      console.log('Nueva contraseña:', newPassword);

      setMessage({ 
        type: 'success', 
        text: 'Contraseña del sistema actualizada exitosamente' 
      });

      // Limpiar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Actualizar información del sistema
      setSystemInfo(prev => ({
        ...prev,
        lastPasswordChange: new Date().toISOString().split('T')[0]
      }));

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al cambiar la contraseña. Intente nuevamente.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 'none', color: 'gray', text: 'Sin contraseña' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 2) return { strength: 'weak', color: 'red', text: 'Débil' };
    if (score < 4) return { strength: 'medium', color: 'yellow', text: 'Media' };
    return { strength: 'strong', color: 'green', text: 'Fuerte' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Configuración del Sistema</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Gestione la configuración de seguridad del sistema
        </p>
      </div>

      {/* Información del sistema */}
      {systemInfo && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Información del Sistema</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Versión:</span>
              <span className="ml-2 font-medium">{systemInfo.version}</span>
            </div>
            <div>
              <span className="text-gray-600">Entorno:</span>
              <span className="ml-2 font-medium capitalize">{systemInfo.environment}</span>
            </div>
            <div>
              <span className="text-gray-600">Último cambio de contraseña:</span>
              <span className="ml-2 font-medium">
                {new Date(systemInfo.lastPasswordChange).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Estado de seguridad:</span>
              <span className="ml-2 font-medium text-green-600">✓ Configurado</span>
            </div>
          </div>
        </div>
      )}

      {/* Cambio de contraseña */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="h-5 w-5 text-blue-500" />
          <h4 className="font-medium text-gray-900">Cambiar Contraseña del Sistema</h4>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Importante:</strong> Esta contraseña se usa para operaciones críticas como 
            la eliminación masiva de datos. Manténgala segura y compártala solo con administradores autorizados.
          </p>
        </div>

        <div className="space-y-4">
          {/* Contraseña actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña actual *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  clearMessage();
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese la contraseña actual"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearMessage();
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese la nueva contraseña"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Indicador de fortaleza */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
                      style={{ 
                        width: passwordStrength.strength === 'weak' ? '33%' : 
                               passwordStrength.strength === 'medium' ? '66%' : '100%' 
                      }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recomendación: Use al menos 8 caracteres con mayúsculas, minúsculas, números y símbolos
                </p>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar nueva contraseña *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearMessage();
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirme la nueva contraseña"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Indicador de coincidencia */}
            {confirmPassword && (
              <div className="mt-1">
                {confirmPassword === newPassword ? (
                  <p className="text-xs text-green-600 flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Las contraseñas coinciden</span>
                  </p>
                ) : (
                  <p className="text-xs text-red-600 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Las contraseñas no coinciden</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Mensaje de estado */}
          {message.text && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.text}
                </span>
              </div>
            </div>
          )}

          {/* Botón de acción */}
          <div className="pt-4">
            <button
              onClick={handlePasswordChange}
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Save className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Información de seguridad */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h4 className="font-medium text-yellow-900 mb-1">Recomendaciones de Seguridad</h4>
            <ul className="text-yellow-800 space-y-1 list-disc list-inside">
              <li>Cambie la contraseña regularmente (al menos cada 3 meses)</li>
              <li>Use una contraseña única que no use en otros sistemas</li>
              <li>No comparta la contraseña por medios inseguros (email, chat, etc.)</li>
              <li>Registre los cambios de contraseña en su log de seguridad</li>
              <li>Asegúrese de que solo administradores autorizados conozcan la contraseña</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;