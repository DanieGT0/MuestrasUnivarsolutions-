import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  onBackdropClick,
  preventBackdropClose = false 
}) => {
  const { isDarkMode } = useTheme();

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    full: 'sm:max-w-full sm:m-4'
  };

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (event) => {
        if (event.key === 'Escape' && !preventBackdropClose) {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      // Prevent scroll on body when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose, preventBackdropClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventBackdropClose) {
      if (onBackdropClick) {
        onBackdropClick();
      } else {
        onClose();
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isDarkMode ? 'dark' : ''}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-in fade-in duration-200" 
        onClick={handleBackdropClick}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className={`
          relative transform overflow-hidden rounded-2xl theme-card 
          px-4 pb-4 pt-5 text-left shadow-xl transition-all 
          animate-in zoom-in-95 duration-300 sm:my-8 sm:w-full 
          ${sizeClasses[size]} sm:p-6 ${className}
        `}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`flex items-center justify-between mb-4 ${headerClassName}`}>
              {title && (
                <h3 className="text-lg font-semibold leading-6 theme-text-primary">
                  {defaultTitle}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 theme-text-tertiary hover:theme-text-secondary transition-colors rounded-md p-1 hover:theme-bg-secondary"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className={`${contentClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal Header Component
export const ModalHeader = ({ children, className = '' }) => (
  <div className={`pb-4 border-b theme-border mb-4 ${className}`}>
    {children}
  </div>
);

// Modal Body Component  
export const ModalBody = ({ children, className = '' }) => (
  <div className={`py-2 ${className}`}>
    {children}
  </div>
);

// Modal Footer Component
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`pt-4 border-t theme-border mt-4 flex justify-end space-x-3 ${className}`}>
    {children}
  </div>
);

// Confirmation Modal Component
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  message,
  confirmText,
  cancelText,
  variant = 'primary', // primary, danger, warning
  icon,
  isLoading = false 
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  
  // Valores por defecto traducidos
  const defaultTitle = title || t('modal.confirmAction', 'Confirmar Acción');
  const defaultMessage = message || t('modal.confirmMessage', '¿Estás seguro de que deseas continuar?');
  const defaultConfirmText = confirmText || t('common.confirm', 'Confirmar');
  const defaultCancelText = cancelText || t('common.cancel', 'Cancelar');
  
  const variantStyles = {
    primary: 'btn-theme-primary',
    danger: 'badge-danger hover:opacity-90',
    warning: 'badge-warning hover:opacity-90'
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
      preventBackdropClose={isLoading}
      className={isDarkMode ? 'dark' : ''}
    >
      <div className="sm:flex sm:items-start">
        {icon && (
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10" 
               style={{ backgroundColor: 'var(--color-primary-light)' }}>
            <div style={{ color: 'var(--color-primary)' }}>
              {icon}
            </div>
          </div>
        )}
        <div className={`mt-3 text-center sm:mt-0 ${icon ? 'sm:ml-4' : ''} sm:text-left flex-1`}>
          <h3 className="text-lg font-semibold leading-6 theme-text-primary">
            {defaultTitle}
          </h3>
          <div className="mt-2">
            <p className="text-sm theme-text-secondary">
              {defaultMessage}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors ${variantStyles[variant]}`}
        >
          {isLoading ? t('common.processing', 'Procesando...') : defaultConfirmText}
        </button>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="mt-3 w-full sm:mt-0 sm:w-auto px-4 py-2 theme-text-secondary theme-bg-secondary hover:theme-bg-tertiary rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {defaultCancelText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;