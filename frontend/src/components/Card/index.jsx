import React from 'react';

/**
 * Reusable Card components.
 */
export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'normal', // none, compact, normal, relaxed
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    compact: 'p-4',
    normal: 'p-6',
    relaxed: 'p-8',
  };

  return (
    <div
      className={`
        bg-surface border border-border rounded-xl shadow-sm overflow-hidden
        ${hoverEffect ? 'transition-all duration-200 hover:shadow-md hover:border-primary/30' : ''}
        ${paddingStyles[padding] || paddingStyles.normal}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`flex flex-col gap-1 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-text-primary tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-text-secondary ${className}`} {...props}>
    {children}
  </p>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`flex-1 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-6 pt-4 border-t border-border flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
