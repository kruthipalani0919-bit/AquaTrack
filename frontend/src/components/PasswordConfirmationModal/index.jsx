import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import Modal from '../Modal';
import { Button } from '../Button';
import { Input } from '../Input';

/**
 * Reusable Password Confirmation Modal for secure deletion.
 */
export const PasswordConfirmationModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Password',
  message = 'For security, enter your account password to delete this record.',
  confirmText = 'Confirm Delete',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setError('Password is required.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onConfirm(trimmedPassword);
      // On success, state resets and modal closes via caller
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        'Incorrect password. Please try again.';

      setError(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isLoading) return;
    setPassword('');
    setError('');
    setIsSubmitting(false);
    if (onClose) onClose();
  };

  const activeLoading = isLoading || isSubmitting;
  const isConfirmDisabled = !password.trim() || activeLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      closeOnBackdrop={!activeLoading}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1" noValidate>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-danger-light text-danger flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-text-secondary">
            {message}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger-light text-danger rounded-lg text-xs font-medium border border-danger/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-1">
          <Input
            type="password"
            label="Account Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            disabled={activeLoading}
            required
            autoFocus
          />
        </div>

        <div className="flex items-center gap-3 w-full justify-end mt-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleClose}
            disabled={activeLoading}
          >
            {cancelText}
          </Button>

          <Button
            type="submit"
            variant="danger"
            fullWidth
            isLoading={activeLoading}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordConfirmationModal;
