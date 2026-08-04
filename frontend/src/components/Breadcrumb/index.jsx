import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Reusable Breadcrumb component.
 */
export const Breadcrumb = ({
  items = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Current Page' }
  ],
  showHome = true,
  className = '',
}) => {
  return (
    <nav className={`flex items-center text-xs text-text-secondary ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 flex-wrap">
        {showHome && (
          <li className="flex items-center gap-1.5">
            <Link
              to="/dashboard"
              className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only">Home</span>
            </Link>
            {items.length > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-secondary/50" />}
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="text-text-secondary hover:text-primary transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-text-primary">
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-text-secondary/50" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
