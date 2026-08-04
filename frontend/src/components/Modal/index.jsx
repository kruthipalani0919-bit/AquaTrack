import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal component.
 */
export const Modal = ({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md', // sm, md, lg, xl, full
  closeOnBackdrop = true,
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`
          w-full bg-surface rounded-2xl shadow-modal border border-border overflow-hidden
          flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200
          ${sizeStyles[size] || sizeStyles.md}
          ${className}
        `}
      >
        {/* Modal Header */}
        {(title || onClose) && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-border/80 shrink-0">
            <div>
              {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
              {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-background transition-colors focus:outline-none"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto aqua-scrollbar flex-1">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/80 bg-background/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
