import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import Modal from '../Modal';
import { Button } from '../Button';

/**
 * Reusable Confirmation Dialog component.
 */
export const ConfirmationDialog = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, info, success
  isLoading = false,
}) => {
  const icons = {
    warning: <AlertTriangle className="w-6 h-6 text-warning" />,
    danger: <AlertCircle className="w-6 h-6 text-danger" />,
    info: <Info className="w-6 h-6 text-accent" />,
    success: <CheckCircle className="w-6 h-6 text-success" />,
  };

  const bgIcons = {
    warning: 'bg-warning-light',
    danger: 'bg-danger-light',
    info: 'bg-accent-light',
    success: 'bg-success-light',
  };

  const confirmVariant = {
    warning: 'primary',
    danger: 'danger',
    info: 'primary',
    success: 'primary',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isLoading}
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className={`w-12 h-12 rounded-full ${bgIcons[type]} flex items-center justify-center mb-4`}>
          {icons[type]}
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>

        <p className="text-xs md:text-sm text-text-secondary mb-6">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full justify-end">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>

          <Button
            variant={confirmVariant[type]}
            fullWidth
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
