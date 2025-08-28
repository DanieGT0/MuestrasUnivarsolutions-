// Professional UI Components for Univar Solutions
import React from 'react';
import { 
  Loader2, CheckCircle2, AlertTriangle, AlertCircle, Info
} from 'lucide-react';

// Professional Card Components
export const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200/60 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-5 border-b border-gray-200/60 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-6 ${className}`}>
    {children}
  </div>
);

// Professional Button Component
export const Button = ({ 
  children, 
  variant = "primary", 
  size = "default", 
  className = "", 
  disabled = false,
  loading = false,
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "btn-theme-primary focus:ring-2",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-sm focus:ring-green-500",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm focus:ring-yellow-500",
    outline: "border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-700 focus:ring-gray-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500"
  };
  
  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// Professional Badge Component
export const Badge = ({ children, variant = "default", size = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    primary: "text-white",
    secondary: "bg-gray-600 text-white"
  };
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variant === 'primary' ? 'badge-primary' : variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

// Professional Alert Component
export const Alert = ({ children, variant = "info", className = "" }) => {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800", 
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    danger: "bg-red-50 border-red-200 text-red-800",
    error: "bg-red-50 border-red-200 text-red-800"
  };
  
  const icons = {
    info: <Info className="h-5 w-5" />,
    success: <CheckCircle2 className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    danger: <AlertCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {icons[variant]}
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ value, className = "", showLabel = false }) => (
  <div className={className}>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="h-2 rounded-full transition-all duration-300 ease-out"
        style={{ backgroundColor: 'var(--color-primary)' }}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    {showLabel && (
      <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
        <span>Progress</span>
        <span>{Math.round(value)}%</span>
      </div>
    )}
  </div>
);

// Page Header Component
export const PageHeader = ({ 
  title, 
  description, 
  icon: Icon, 
  badge,
  actions,
  className = "" 
}) => (
  <div className={`bg-white border-b border-gray-200/60 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between py-6">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-600 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {badge && badge}
          {actions && actions}
        </div>
      </div>
    </div>
  </div>
);