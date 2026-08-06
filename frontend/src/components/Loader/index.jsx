import React from 'react';

/**
 * Reusable Loading Spinner component.
 */
export const Loader = ({
  size = 'md', // sm, md, lg, xl
  color = 'primary', // primary, secondary, white, current
  fullPage = false,
  text,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorStyles = {
    primary: 'border-primary/20 border-t-primary',
    secondary: 'border-secondary/20 border-t-secondary',
    accent: 'border-accent/20 border-t-accent',
    white: 'border-white/20 border-t-white',
    current: 'border-current/20 border-t-current',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeStyles[size] || sizeStyles.md} ${colorStyles[color] || colorStyles.primary}`}
        role="status"
        aria-label="loading"
      />
      {text && <p className="text-xs font-medium text-text-secondary animate-pulse">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const LoadingSpinner = Loader;

export default Loader;
