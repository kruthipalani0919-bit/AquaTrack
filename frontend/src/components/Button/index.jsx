import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component following AquaTrack design system.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-sm focus:ring-primary/40 active:bg-teal-900',
    secondary: 'bg-secondary-light hover:bg-teal-100 text-primary font-semibold focus:ring-secondary/40 active:bg-teal-200',
    accent: 'bg-accent hover:bg-accent-hover text-white shadow-sm focus:ring-accent/40 active:bg-cyan-700',
    outline: 'border border-border bg-surface hover:bg-background text-text-primary focus:ring-primary/30 active:bg-gray-100',
    ghost: 'text-text-primary hover:bg-background hover:text-primary focus:ring-primary/20',
    danger: 'bg-danger hover:bg-red-600 text-white shadow-sm focus:ring-danger/40 active:bg-red-700',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};

export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;

export default Button;
