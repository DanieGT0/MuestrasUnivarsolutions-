import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Enhanced Input Component with theme support
export const Input = ({
  label,
  error,
  required = false,
  helperText,
  className = '',
  inputClassName = '',
  labelClassName = '',
  type = 'text',
  ...props
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${isDarkMode ? 'dark' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={props.id || props.name}
          className={`block text-sm font-medium theme-text-primary mb-2 ${labelClassName}`}
        >
          {label} {required && <span className="badge-danger px-1 rounded">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`
          theme-input w-full px-3 py-2 border rounded-lg 
          focus:outline-none focus:ring-2 transition-colors
          ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-primary'}
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${inputClassName}
        `}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs theme-text-tertiary mt-1">{helperText}</p>
      )}
      {error && (
        <p className="badge-danger text-sm mt-1 px-2 py-1 rounded inline-block">
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced Select Component
export const Select = ({
  label,
  error,
  required = false,
  helperText,
  children,
  className = '',
  selectClassName = '',
  labelClassName = '',
  ...props
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${isDarkMode ? 'dark' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={props.id || props.name}
          className={`block text-sm font-medium theme-text-primary mb-2 ${labelClassName}`}
        >
          {label} {required && <span className="badge-danger px-1 rounded">*</span>}
        </label>
      )}
      <select
        className={`
          theme-input w-full px-3 py-2 border rounded-lg 
          focus:outline-none focus:ring-2 transition-colors
          ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-primary'}
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectClassName}
        `}
        {...props}
      >
        {children}
      </select>
      {helperText && !error && (
        <p className="text-xs theme-text-tertiary mt-1">{helperText}</p>
      )}
      {error && (
        <p className="badge-danger text-sm mt-1 px-2 py-1 rounded inline-block">
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced Textarea Component
export const Textarea = ({
  label,
  error,
  required = false,
  helperText,
  className = '',
  textareaClassName = '',
  labelClassName = '',
  rows = 3,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${isDarkMode ? 'dark' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={props.id || props.name}
          className={`block text-sm font-medium theme-text-primary mb-2 ${labelClassName}`}
        >
          {label} {required && <span className="badge-danger px-1 rounded">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          theme-input w-full px-3 py-2 border rounded-lg 
          focus:outline-none focus:ring-2 transition-colors resize-vertical
          ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-primary'}
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${textareaClassName}
        `}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs theme-text-tertiary mt-1">{helperText}</p>
      )}
      {error && (
        <p className="badge-danger text-sm mt-1 px-2 py-1 rounded inline-block">
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const baseClasses = `
    inline-flex items-center justify-center rounded-lg font-medium 
    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
  `;

  const variants = {
    primary: 'btn-theme-primary focus:ring-primary/50',
    secondary: 'btn-theme-secondary focus:ring-secondary/50',
    outline: 'border-2 theme-border theme-text-primary hover:theme-bg-secondary focus:ring-primary/50',
    ghost: 'theme-text-secondary hover:theme-bg-secondary focus:ring-primary/50',
    danger: 'badge-danger hover:opacity-90 focus:ring-red-500/50',
    success: 'badge-success hover:opacity-90 focus:ring-green-500/50',
    warning: 'badge-warning hover:opacity-90 focus:ring-yellow-500/50',
    info: 'badge-info hover:opacity-90 focus:ring-offset-2'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${isDarkMode ? 'dark' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {Icon && iconPosition === 'left' && !isLoading && (
        <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
      )}
      
      {isLoading && (
        <svg className={`animate-spin w-4 h-4 ${children ? 'mr-2' : ''}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !isLoading && (
        <Icon className={`w-4 h-4 ${children ? 'ml-2' : ''}`} />
      )}
    </button>
  );
};

// Form Group Component for consistent spacing
export const FormGroup = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {children}
  </div>
);

// Form Row Component for grid layouts
export const FormRow = ({ children, className = '', columns = 2 }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Alert Component for form notifications
export const Alert = ({ 
  children, 
  variant = 'info', 
  className = '',
  icon: Icon,
  title,
  onClose 
}) => {
  const { isDarkMode } = useTheme();

  const variants = {
    info: { bg: 'var(--color-info)', text: 'white' },
    success: { bg: 'var(--color-success)', text: 'white' },
    warning: { bg: 'var(--color-warning)', text: 'white' },
    danger: { bg: 'var(--color-danger)', text: 'white' }
  };

  return (
    <div 
      className={`rounded-lg p-4 ${isDarkMode ? 'dark' : ''} ${className}`}
      style={{ 
        backgroundColor: variants[variant].bg, 
        color: variants[variant].text,
        opacity: 0.9
      }}
    >
      <div className="flex items-start">
        {Icon && (
          <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        )}
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  Input,
  Select,
  Textarea,
  Button,
  FormGroup,
  FormRow,
  Alert
};