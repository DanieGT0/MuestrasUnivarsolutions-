import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { buildApiUrl } from '../../config/api';
import { Eye, EyeOff, Package, Mail, Lock, AlertCircle } from 'lucide-react';

// Función de login integrada directamente
const loginToBackend = async (email, password) => {
  try {
    const response = await fetch(buildApiUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al iniciar sesion');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const Input = ({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  icon: Icon,
  error,
  className = "",
  ...props 
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {Icon && <Icon className="h-5 w-5 text-gray-400" />}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
        error 
          ? 'border-red-300 bg-red-50' 
          : 'border-gray-300 bg-white hover:border-gray-400'
      } ${className}`}
      {...props}
    />
    {error && (
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <AlertCircle className="h-5 w-5 text-red-400" />
      </div>
    )}
  </div>
);

const Button = ({ 
  children, 
  type = "button", 
  variant = "primary", 
  size = "default",
  loading = false,
  disabled = false,
  className = "", 
  onClick,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 shadow-md hover:shadow-lg",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
    ghost: "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
  };
  
  const sizes = {
    default: "px-6 py-3 text-base",
    sm: "px-4 py-2 text-sm",
    lg: "px-8 py-4 text-lg"
  };
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Iniciando sesion...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default function LoginPage({ onLoginSuccess }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: 'admin@muestrasunivar.com', // Pre-llenado para testing
    password: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('auth.emailRequired', 'El correo electronico es requerido');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid', 'El correo electronico no es valido');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired', 'La contrasena es requerida');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength', 'La contrasena debe tener al menos 6 caracteres');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await loginToBackend(formData.email, formData.password);
      
      console.log('Login exitoso:', response);
      
      // Guardar datos en localStorage (ya lo hace el servicio)
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      // Notificar éxito al componente padre
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      } else {
        // Si no hay callback, mostrar mensaje
        alert(`¡Bienvenido ${response.user.full_name}! Redirigiendo al dashboard...`);
        // Aquí podrías hacer window.location.href = '/dashboard' 
        // o usar React Router para navegar
      }
      
    } catch (error) {
      console.error('Error de login:', error);
      setErrors({ 
        general: error.message || 'Error al iniciar sesion. Verifica tus credenciales.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleForgotPassword = () => {
    alert('Funcionalidad de recuperar contrasena proximamente...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-2xl shadow-lg mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Muestras Univar</h1>
          <p className="text-gray-600">Ingresa a tu cuenta para continuar</p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{errors.general}</span>
              </div>
            )}

            {/* Info de testing */}
            <div className="rounded-lg p-4 border" style={{ 
              backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)', 
              borderColor: 'rgba(var(--color-primary-rgb), 0.3)' 
            }}>
              <div className="text-sm" style={{ color: 'var(--color-primary)' }}>
                <div className="font-medium mb-1">Credenciales de prueba:</div>
                <div>📧 admin@muestrasunivar.com</div>
                <div>🔒 admin123</div>
              </div>
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correo Electronico
              </label>
              <Input
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                icon={Mail}
                error={errors.email}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Campo Contrasena */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Contrasena
              </label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  icon={Lock}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Recordar sesion y Olvide contrasena */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordar sesion
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-orange-600 hover:text-orange-500 font-medium"
              >
                ¿Olvidaste tu contrasena?
              </button>
            </div>

            {/* Botón de Login */}
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              onClick={handleSubmit}
              className="w-full"
            >
              Iniciar Sesion
            </Button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Necesitas acceso?{' '}
                <span className="text-orange-600 font-medium cursor-pointer hover:text-orange-500">
                  Contacta al administrador
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2025 Univar. Sistema de Gestión de Muestras.
          </p>
        </div>
      </div>
    </div>
  );
}